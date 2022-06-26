export class CompileError extends Error {
    
    constructor(public code: string, public cause: unknown) {
        super("[CompileError]" + (cause instanceof Error ? " " + cause.message : ""));
        Object.setPrototypeOf(this, CompileError.prototype);
    }
}
