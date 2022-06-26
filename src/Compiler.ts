import { CompileError } from "./CompileError";
import { Helper } from "./Helper";

export interface BaseHelper {
    text(str: string): string;
    escapeHtml(str: string|number|boolean): string;
}

export type TemplateFunc<M = unknown, C = unknown, H extends BaseHelper = BaseHelper, V = unknown> = (model?: M, context?: C, helper?: H, viewBag?: V) => string;

export class TemplateCompiler {
    
    static DEFAULT_HELPER = new Helper();
    
    static generateCode(template: string): string {
        let i = 0;
        let funcAsString = "";
        const pushString = (strIn: string, isCode: boolean, writeCode: number): void => {
            if (strIn.length === 0) {
                return;
            }
            if (isCode) {
                if (writeCode === 1) {
                    funcAsString += "write(" + strIn + ");";
                }
                else if (writeCode === 2) {
                    funcAsString += "write(Helper.escapeHtml(" + strIn + "));";
                }
                else if (writeCode === 3) {
                    funcAsString += "write(Helper.text(" + strIn + "));";
                }
                else {
                    funcAsString += strIn;
                }
            }
            else {
                funcAsString += "write(\"" + strIn.replace(/"/g, "\\\"").replace(/\n/g, "\\n").replace(/\r/g, "\\r") + "\");";
            }
        };
        const process = (isCode: boolean, withOpenTag: boolean, writeCode: number) => {
            while (i < template.length) {
                const index = template.indexOf("{{", i);
                const index2 = template.indexOf("}}", i);
                if (index != -1 && index < index2) {
                    pushString(template.substring(i, index), isCode, writeCode);
                    i = index + 2;
                    let writeCodeInChild = 0;
                    if (isCode === false && template[i] === "#") {
                        writeCodeInChild = 1;
                        i++;
                    }
                    else if (isCode === false && template[i] === "@") {
                        writeCodeInChild = 2;
                        i++;
                    }
                    else if (isCode === false && template[i] === "$") {
                        writeCodeInChild = 3;
                        i++;
                    }
                    process(!isCode, true, writeCodeInChild);
                    continue;
                }
                if (withOpenTag) {
                    if (index2 !== -1) {
                        pushString(template.substring(i, index2), isCode, writeCode);
                        i = index2 + 2;
                        break;
                    }
                }
                pushString(template.substring(i), isCode, writeCode);
                i = template.length;
            }
        };
        process(false, false, 0);
        return "(function(model, context, Helper, viewBag) {\n    Helper = Helper || defaultHelper; let result = \"\";\n    function write(str) { result += str; };\n    " + funcAsString + "\n    return result;\n})";
    }
    
    static compile<M = unknown, C = unknown, H extends BaseHelper = BaseHelper, V = unknown>(html: string, defaultHelper?: H): TemplateFunc<M, C, H, V> {
        const code = TemplateCompiler.generateCode(html);
        defaultHelper = defaultHelper || <H><unknown>TemplateCompiler.DEFAULT_HELPER;
        try {
            return eval(code);
        }
        catch (e) {
            throw new CompileError(code, e);
        }
    }
}
