function Var(id) {
    this.type = 'var';
    this.id = id;
    this.free_vars = new Set([id]);
}

function App(func, arg) {
    this.type = 'app';
    this.func = func;
    this.arg = arg;
    this.free_vars = new Set([...func.free_vars, ...arg.free_vars]);
}

function Abs(v, expr) {
    this.type = 'abs';
    this.var = v;
    this.expr = expr;
    this.free_vars = new Set([...expr.free_vars]);
    this.free_vars.delete(this.var.id);
}

// unnecessary parenthesises uses in some abstractions
function ast_to_expr(expr) {
    switch (expr.type) {
        case 'var': return expr.id;
        case 'abs': return `(λ${expr.var.id}.${ast_to_expr(expr.expr)})`;
        case 'app':
            return ast_to_expr(expr.func) + ' ' + (expr.arg.type == 'app' ? 
            '('+ast_to_expr(expr.arg)+')' : 
            ast_to_expr(expr.arg));
    }
}

var redexes = 0;
function stepper(node) {
    switch (node.type) {
        case 'var': return { stepped: false, node: node };
        case 'app':
            switch(node.func.type) {
                case 'var':
                case 'app':
                    let func_evaled = stepper(node.func);
                    if (func_evaled.stepped) {
                        return {stepped: true, node: new App(func_evaled.node, node.arg)};
                    }
                    let arg_evaled = stepper(node.arg);
                    return {stepped: arg_evaled.stepped, node: new App(node.func, arg_evaled.node)};
                case 'abs': // redex
                    redexes++;
                    return {stepped: true, node: substitute(node.arg, node.func.var, node.func.expr)}
            }
            break;
        case 'abs':
            let new_expr = stepper(node.expr);
            return { stepped : new_expr.stepped, node : new Abs(node.var, new_expr.node) };
    }
}

// sub e for x (variable) in expr
function substitute(e, x, expr) {
    switch (expr.type) {
        case 'var': return expr.id == x.id ? e : expr;
        case 'app': return new App(substitute(e, x, expr.func), substitute(e, x, expr.arg));
        case 'abs':
            if(expr.var.id == x.id) {
                return expr;
            }
            else if(!e.free_vars.has(expr.var.id)) {
                return new Abs(expr.var, substitute(e, x, expr.expr));
            }
            else {
                do {
                    var z = rename(expr.var.id);
                } while(e.free_vars.has(z) || variables(expr.expr).has(z));
                return new Abs(new Var(z), substitute(e, x, substitute(new Var(z), expr.var, expr.expr)));
            }
    }
}

function rename(variable) {
    let [match, prefix, num] = /^(.*?)([\d]*)$/.exec(variable);
    return prefix + (num == '' ? 1 : parseInt(num) + 1);
}

function variables(expr) {
    switch (expr.type) {
        case 'var': return new Set([expr.id]);
        case 'app': return new Set([...variables(expr.func), ...variables(expr.arg)]);
        case 'abs': return new Set([...variables(expr.expr), expr.var.id]);
    }
}

function stack_to_output(stack, output, condition) {
    while(stack.length > 0 && condition()) {
        let top = stack.pop();
        let s = output.pop();
        let f = output.pop();
        output.push(top == '.' ? new Abs(f, s) : new App(f, s));
    }
}

// shunting yard algorithm
function parse(tokens) {
    let output = [];
    let stack = [];
    while(tokens.length > 0) {
        let current = tokens.shift();
        if(current.match(/\w+/)) {
            output.push(new Var(current));
        }
        else if(current.match(/\s+/)) { // only swap if both o1 and o2 are application
            stack_to_output(stack, output, () => stack[stack.length-1].match(/\s+/));
            stack.push(current);
        }
        else if(current == "(" || current == '.') {
            stack.push(current);
        }
        else if(current == ")") {
            stack_to_output(stack, output, () => stack[stack.length-1] != '(');
            if(stack.length == 0) {
                console.log("mismatched parenthesis");
            }
            stack.pop(); // pop off left paren
        }
    }
    if(stack.indexOf('(') != -1 || stack.indexOf(')') != -1) {
        console.log("mismatched parenthesis");
    } else {
        stack_to_output(stack, output, () => true);
    }
    return output.pop();
}

// remove any space that isn't in one of the following spots: )_(, x_(, )_x, x_x, x_\, )_\
function remove_extra_spaces(str) {
    return str.trim().replace(/\s+([^\(\wλ])/g, '$1').replace(/([^\)\w])\s+/g, '$1');
}

// all spaces are lambda application => whitespace matters
function lex(str) {
    let tokens = remove_extra_spaces(str).split(/(\)|\(|λ|\.|\w+|\s+)/).filter(t => t != '');
    return tokens;
}

function run(expr) {
    let t = new Date().getTime();
    let ast = parse(lex(expr));
    let new_expr = stepper(ast);
    while(new_expr.stepped) {
        // console.log(redexes + ': ' + ast_to_expr(new_expr.node));
        new_expr = stepper(new_expr.node);
    }
    let delay = new Date().getTime() - t;
    console.log('delay: ' + delay);
    console.log('redexes: ' + redexes);
    console.log('final: ' + ast_to_expr(new_expr.node));
}

const fs = require('fs');
let filename = process.argv[2];
let expr = fs.readFileSync(filename).toString();
run(expr);