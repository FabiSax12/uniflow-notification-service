export enum PriorityEnum {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class Priority {
  constructor(private readonly value: PriorityEnum) {}

  getValue(): PriorityEnum {
    return this.value;
  }

  equals(other: Priority): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static fromString(value: string): Priority {
    const enumValue = Object.values(PriorityEnum).find(
      (v: string) => v === value,
    );
    if (!enumValue) {
      throw new Error(`Invalid priority: ${value}`);
    }
    return new Priority(enumValue);
  }

  isHigherThan(other: Priority): boolean {
    const priorityOrder = {
      [PriorityEnum.LOW]: 1,
      [PriorityEnum.MEDIUM]: 2,
      [PriorityEnum.HIGH]: 3,
    };
    return priorityOrder[this.value] > priorityOrder[other.value];
  }
}
