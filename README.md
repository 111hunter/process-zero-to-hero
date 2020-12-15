# λ-calculus interpreter 

A λ-calculus interpreter written in JavaScript

## Running

Clone this repo, and run:

```
$ node interpreter.js example.lambda
```

example.lambda is the factorial of 5. As a result of running the example, x is called 120 times by f

```
delay: 914
redexes: 26898
final: (λf.(λx.f (f ... (f x) ... ))
```

Interpreter modified from the project [parkertimmins/lambda_interpreter](https://github.com/parkertimmins/lambda_interpreter), thank you very much