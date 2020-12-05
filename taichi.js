let Y = f => (x => f(y => x(x)(y)))(x => f(y => x(x)(y)));

let F = a => b => b;
let T = a => b => a;

let zero = f => x => x;
let one = f => x => f(x);
let two = f => x => f(f(x));
let three = f => x => f(f(f(x)));
let four = f => x => f(f(f(f(x))));
let five = f => x => f(f(f(f(f(x)))));

let pair = x => y => z => z(x)(y);
let left = p => p(x => y => x);
let right = p =>p(x => y => y);
let empty = pair(T)(T);
let ushift = l => x => pair(F)(pair(x)(l));
let is_empty = left;
let first = l => left(right(l));
let rest = l => right(right(l));

let if_else = b => b;
let is_zero = f => f(x => F)(T);
let is_less_or_equal = m => n => is_zero(minus(m)(n));

let succ = n => f => x => f(n(f)(x));
let slide = p => pair(right(p))(succ(right(p)));
let pred = n => left(n(slide)(pair(zero)(zero)));

let plus = m => n => n(succ)(m);
let minus = m => n => n(pred)(m);
let mult = m => n => n(plus(m))(zero);
let div = Y(f => m => n =>
    if_else(is_less_or_equal(n)(m))
        (x=>succ(f(minus(m)(n))(n))(x))
        (zero)
);

let a = two;
let b = succ(a);
let aa = ushift(ushift(empty)(a))(a);
let ab = ushift(ushift(empty)(b))(a);
let abaa = ushift(ushift(aa)(b))(a);

let to_boolean = p => if_else(p)('T')('F');
let to_char = c => 
    if_else(is_zero(c))('0')(
        if_else(is_zero(pred(c)))('1')(
            if_else(is_zero(two(pred)(c)))('a')('b')
        )
    );
let fold = Y(f => l => x => g => 
    if_else(is_empty(l))
        (x)
        (y=>g(f(rest(l))(x)(g))(first(l))(y))
);
let pushs = l => x => fold(l)(ushift(empty)(x))(ushift);
let to_digits = Y(f => n => pushs(
    if_else(is_less_or_equal(n)(pred(two)))
        (empty)
        (x => f(div(n)(two))(x))
    )(mod(n)(two))
)
let mod = Y(f => m => n => 
    if_else(is_less_or_equal(n)(m))
        (x => f(minus(m)(n))(n)(x))
        (m)
);
let range = Y(f => m => n => 
    if_else(is_less_or_equal(m)(n))
        (x => ushift(f(succ(m))(n))(m)(x))
        (empty)
);
let maps = k => f => fold(k)(empty)(l => x => ushift(l)(f(x)));
let twenty = mult(four)(five);

let my_list = maps(range(one)(twenty))(n => 
    if_else(is_zero(mod(n)(succ(five))))(abaa)(
        if_else(is_zero(mod(n)(three)))(aa)(
            if_else(is_zero(mod(n)(two)))(ab)(to_digits(n))
        )
    )        
);

// 上面的代码只用函数已经完成了所有计算，计算结果是单个字符组成的链表
// 将计算结果存入二维数组并输出，以便人眼观察
let to_array = proc => {
    let arr = [];
    while(to_boolean(is_empty(proc))!='T'){
        arr.push(first(proc));
        proc = rest(proc);
    }
    return arr;
}
let to_string = s => to_array(s).map(c => to_char(c)).join('');
console.log(to_array(my_list).map(v=>to_string(v)));

// 不然，只能像下面这样每次输出单个字符
let fact = Y(f => n => is_zero(n)(one)(
    x => mult(n)(f(pred(n)))(x)
));
let to_c = s => to_char(first(s));
let s1 = to_digits(fact(four));
let s2 = rest(s1);
let s3 = rest(s2);
let s4 = rest(s3);
let s5 = rest(s4);
// console.log(to_c(s1) + to_c(s2) + to_c(s3) + to_c(s4) + to_c(s5));