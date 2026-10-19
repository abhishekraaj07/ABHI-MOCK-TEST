/**
 * Option.ts
 * Object-Oriented Domain Model for Multiple-Choice Options.
 * Demonstrates: Encapsulation (private readonly state, immutability, validation).
 */

export class Option {
  private readonly _id: string;
  private readonly _optionKey: string; // 'A', 'B', 'C', 'D'
  private readonly _optionText: string;
  private readonly _isCorrect: boolean;

  constructor(key: string, text: string, isCorrect: boolean, id?: string) {
    if (!key || !['A', 'B', 'C', 'D'].includes(key.toUpperCase())) {
      throw new Error(`Invalid option key '${key}'. Must be A, B, C, or D.`);
    }
    if (!text || text.trim().length === 0) {
      throw new Error(`Option text cannot be empty for key ${key}.`);
    }

    this._optionKey = key.toUpperCase();
    this._optionText = text.trim();
    this._isCorrect = Boolean(isCorrect);
    this._id = id || `opt-${this._optionKey.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Getters (Encapsulated Read-Only Access)
  public get id(): string {
    return this._id;
  }

  public get optionKey(): string {
    return this._optionKey;
  }

  public get optionText(): string {
    return this._optionText;
  }

  public get isCorrect(): boolean {
    return this._isCorrect;
  }

  // Factory Helper Method
  public static create(key: string, text: string, isCorrect = false, id?: string): Option {
    return new Option(key, text, isCorrect, id);
  }

  // Serialization to standard plain object
  public toJSON() {
    return {
      id: this._id,
      optionKey: this._optionKey,
      optionText: this._optionText,
      isCorrect: this._isCorrect,
    };
  }
}
