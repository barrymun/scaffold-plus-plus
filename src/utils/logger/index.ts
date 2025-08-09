export class Logger {
  private indentLevel = 0;

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object") {
      return JSON.stringify(error);
    }

    return String(error);
  }

  log(message: string) {
    console.log("  ".repeat(this.indentLevel) + message);
  }

  success(message: string) {
    console.log("  ".repeat(this.indentLevel) + "✅ " + message);
  }

  warning(message: string) {
    console.warn("  ".repeat(this.indentLevel) + "⚠️ " + message);
  }

  error(error: unknown) {
    const message = this.formatError(error);
    console.error("  ".repeat(this.indentLevel) + "❌ " + message);
  }

  indent() {
    this.indentLevel++;
  }

  outdent() {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }

  resetIndent() {
    this.indentLevel = 0;
  }
}
