export class Helper {
    
    static entityMap: {[name: string]: string} = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    
    escapeHtml(str: string|number|boolean): string {
        if (str == null) {
            return "";
        }
        const ss = typeof(str) == "string" ? str : str.toString();
        return ss.replace(/[&<>"'`=\/]/g, s => {
            return <string>Helper.entityMap[s];
        });
    }
    
    escapeHtmlLight(str: string|number|boolean): string {
        if (str == null) {
            return "";
        }
        const ss = typeof(str) == "string" ? str : str.toString();
        return ss.replace(/[&<>"'`=]/g, s => {
            return <string>Helper.entityMap[s];
        });
    }
    
    text(str: string): string {
        const escapedStr = this.escapeHtml(str);
        return this.nl2br(escapedStr);
    }
    
    pad(strArg: number|string, length: number, char: string, type?: string): string {
        const str = strArg.toString();
        if (str.length >= length) {
            return str;
        }
        char = char || " ";
        const padLength = length - str.length;
        let pad = "";
        for (let i = 0; i < padLength; i++) {
            pad += char;
        }
        return type == "right" ? str + pad : pad + str;
    }
    
    date(dateArg: Date|number|string): string {
        const date = (typeof(dateArg) == "object") ? <Date>dateArg : new Date(parseInt(<string>dateArg));
        return date.getFullYear() + "-" + this.pad(date.getMonth() + 1, 2, "0") + "-" + this.pad(date.getDate(), 2, "0");
    }
    
    dateWithHourLocal(dateArg: Date|number|string): string {
        const date = (typeof(dateArg) == "object") ? <Date>dateArg : new Date(parseInt(<string>dateArg));
        return date.getFullYear() + "-" + this.pad(date.getMonth() + 1, 2, "0") + "-" + this.pad(date.getDate(), 2, "0") + " " + this.pad(date.getHours(), 2, "0") + ":" + this.pad(date.getMinutes(), 2, "0") + "." + this.pad(date.getSeconds(), 2, "0");
    }
    
    linkify(inputText: string, skipHtmlEscaping?: boolean) {
        let replacedText = inputText;
        
        if( ! skipHtmlEscaping ) {
            replacedText = this.escapeHtml(inputText);
        }
        
        // URLs starting with http://, https://, or ftp://
        const replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = replacedText.replace(replacePattern1, '<a href="$1" class="linkify" target="_blank" tabindex="-1">$1</a>');
        
        // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" class="linkify" target="_blank" tabindex="-1">$2</a>');
        
        // Change email addresses to mailto:: links.
        const replacePattern3 = this.createFindEmailRegex();
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" class="linkify" target="_blank" tabindex="-1">$1</a>');
        
        replacedText = this.nl2br(replacedText);
        
        return replacedText;
    }
    
    getLinks(text: string): string[] {
        const res: {index: number; str: string}[] = [];
        let regArray: RegExpMatchArray|null;
        // URLs starting with http://, https://, or ftp://
        const replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        while ((regArray = replacePattern1.exec(text)) != null) res.push({index: regArray.index as number, str: (regArray[0] as string).trim()});
        // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        while ((regArray = replacePattern2.exec(text)) != null) res.push({index: regArray.index as number, str: "http://" + (regArray[0] as string).trim()});
        // Change email addresses to mailto:: links.
        const replacePattern3 = this.createFindEmailRegex();
        while ((regArray = replacePattern3.exec(text)) != null) res.push({index: regArray.index as number, str: "mailto:" + (regArray[0] as string).trim()});
        res.sort((a, b) => a.index - b.index);
        return res.map(x => x.str);
    }
    
    nl2br(text: string): string {
        return text.replace(/(\r\n|\n\r|\r|\n)/g, "<br>");
    }
    
    bytesSize(size: number): string {
        const base = 1024;
        const exp = Math.log(size) / Math.log(base) | 0;
        const result = size / Math.pow(base, exp);
        const rounded = Math.floor(result * 100) / 100;
        return rounded + ' ' + (exp == 0 ? '' : 'KMGTPEZY'[exp - 1]) + 'B';
    }
    
    truncate(text: string, size: number, suffix?: string): string {
        suffix = suffix || "...";
        if (!text) {
            return "";
        }
        if (text.length > size) {
            return text.slice(0, size) + suffix;
        }
        return text;
    }
    
    getBaseEmailRegexStr() {
        return "([a-zA-Z][a-zA-Z0-9_\\+\\-\\.]*@((([a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])|([a-zA-Z0-9]))\\.)+([a-zA-Z]{2,6}))";
    }
    
    createFindEmailRegex() {
        return new RegExp(this.getBaseEmailRegexStr(), "gim")
    }
}
