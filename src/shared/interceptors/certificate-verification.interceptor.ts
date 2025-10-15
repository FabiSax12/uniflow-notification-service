import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class CertificateVerificationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CertificateVerificationInterceptor.name);
  private readonly allowedThumbprints: Set<string>;
  private readonly isAzure: boolean;

  constructor(private readonly configService: ConfigService) {
    const thumbprintsEnv = this.configService.get<string>(
      'ALLOWED_CERTIFICATE_THUMBPRINTS',
      '',
    );

    this.allowedThumbprints = new Set(
      thumbprintsEnv
        .split(',')
        .map((thumbprint) => thumbprint.trim().toUpperCase())
        .filter((thumbprint) => thumbprint.length > 0),
    );

    this.isAzure = !!this.configService.get<string>('WEBSITE_INSTANCE_ID');

    if (this.allowedThumbprints.size === 0) {
      this.logger.warn(
        'No certificate thumbprints configured. Certificate verification will reject all requests.',
      );
    } else {
      this.logger.log(
        `Certificate verification enabled with ${this.allowedThumbprints.size} allowed thumbprint(s) - Running in ${this.isAzure ? 'Azure' : 'local'} mode`,
      );
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType();

    if (contextType === 'ws') {
      this.logger.debug('Skipping certificate verification for WebSocket connection');
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    if (this.isWebSocketRequest(request)) {
      this.logger.debug('Skipping certificate verification for Socket.IO/WebSocket request');
      return next.handle();
    }

    if (this.isAzure) {
      this.verifyAzureCertificate(request);
    } else {
      this.verifyDirectTLSCertificate(request);
    }

    return next.handle();
  }

  /**
   * Verificar certificado en Azure Web App (desde header)
   * Replicando exactamente la lógica de Java/Spring Boot
   */
  private verifyAzureCertificate(request: any): void {
    const certHeader = request.headers['x-arr-clientcert'];

    if (!certHeader) {
      this.logger.error('Certificate verification failed: No X-ARR-ClientCert header found');
      throw new UnauthorizedException(
        'Client certificate required for authentication',
      );
    }

    try {
      const certBytes = Buffer.from(certHeader, 'base64');

      const thumbprint = crypto
        .createHash('sha1')
        .update(certBytes)
        .digest('hex')
        .toUpperCase();

      this.logger.debug(`Calculated thumbprint: ${thumbprint}`);

      if (!this.allowedThumbprints.has(thumbprint)) {
        this.logger.error(
          `Certificate verification failed: Thumbprint ${thumbprint} not in allowed list`,
        );
        throw new UnauthorizedException('Client certificate not authorized');
      }

      this.logger.log(
        `Certificate verification successful for thumbprint: ${thumbprint}`,
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Certificate verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid client certificate format');
    }
  }

  private verifyDirectTLSCertificate(request: any): void {
    const socket = request.socket;

    if (!socket.encrypted) {
      this.logger.error('Certificate verification failed: Connection is not encrypted');
      throw new UnauthorizedException(
        'TLS client certificate required for authentication',
      );
    }

    const peerCertificate = socket.getPeerCertificate();

    if (!peerCertificate || Object.keys(peerCertificate).length === 0) {
      this.logger.error('Certificate verification failed: No client certificate provided');
      throw new UnauthorizedException(
        'Client certificate required for authentication',
      );
    }

    const thumbprint = this.calculateThumbprint(peerCertificate);

    if (!this.allowedThumbprints.has(thumbprint)) {
      this.logger.error(
        `Certificate verification failed: Thumbprint ${thumbprint} not in allowed list`,
      );
      throw new UnauthorizedException('Client certificate not authorized');
    }

    this.logger.log(
      `Certificate verification successful for thumbprint: ${thumbprint}`,
    );
  }

  private calculateThumbprint(certificate: any): string {
    const derCertificate = certificate.raw;

    if (!derCertificate) {
      throw new UnauthorizedException('Unable to extract certificate data');
    }

    const hash = crypto.createHash('sha1');
    hash.update(derCertificate);

    return hash.digest('hex').toUpperCase();
  }

  private isWebSocketRequest(request: any): boolean {
    const upgrade = request.headers?.upgrade?.toLowerCase();
    const connection = request.headers?.connection?.toLowerCase();

    if (upgrade === 'websocket' || connection?.includes('upgrade')) {
      return true;
    }

    const url = request.url || '';
    if (url.startsWith('/socket.io')) {
      return true;
    }

    return false;
  }
}