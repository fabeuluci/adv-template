import * as assert from "assert";
import { TemplateCompiler } from "../Compiler";
import "q2-test";

it("Template should return a valid html", () => {
    const expected = `<div>abc&lt;i&gt;&lt;&#x2F;i&gt;&amp;zxc
qwe</div><span>abc<i></i>&zxc
qwe</span><p>abc&lt;i&gt;&lt;&#x2F;i&gt;&amp;zxc<br>qwe</p>`;
    
    const template = TemplateCompiler.compile<{text: string}>("<div>{{@model.text}}</div><span>{{#model.text}}</span><p>{{$model.text}}</p>");
    const output = template({text: "abc<i></i>&zxc\nqwe"});
    
    assert(expected === output)
});
