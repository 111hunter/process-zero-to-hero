const Y = f => (x => f(y => x(x)(y)))(x => f(y => x(x)(y)));

const F = a => b => b;
const T = a => b => a;

const zero = f => x => x;
const one = f => x => f(x);
const two = f => x => f(f(x));
const three = f => x => f(f(f(x)));
const four = f => x => f(f(f(f(x))));
const five = f => x => f(f(f(f(f(x)))));

const pair = x => y => z => z(x)(y);
const left = p => p(x => y => x);
const right = p =>p(x => y => y);
const empty = pair(T)(T);
const ushift = l => x => pair(F)(pair(x)(l));
const is_empty = left;
const first = l => left(right(l));
const rest = l => right(right(l));

const if_else = b => b;
const is_zero = f => f(x => F)(T);
const is_less_or_equal = m => n => is_zero(minus(m)(n));

const succ = n => f => x => f(n(f)(x));
const slide = p => pair(right(p))(succ(right(p)));
const pred = n => left(n(slide)(pair(zero)(zero)));

const plus = m => n => n(succ)(m);
const minus = m => n => n(pred)(m);
const mult = m => n => n(plus(m))(zero);
const div = Y(f => m => n =>
    if_else(is_less_or_equal(n)(m))
        (x=>succ(f(minus(m)(n))(n))(x))
        (zero)
);

const a = two;
const b = succ(a);
const aa = ushift(ushift(empty)(a))(a);
const ab = ushift(ushift(empty)(b))(a);
const abaa = ushift(ushift(aa)(b))(a);

const to_boolean = p => if_else(p)('T')('F');
const to_char = c => 
    if_else(is_zero(c))('0')(
        if_else(is_zero(pred(c)))('1')(
            if_else(is_zero(two(pred)(c)))('a')('b')
        )
    );
const fold = Y(f => l => x => g => 
    if_else(is_empty(l))
        (x)
        (y=>g(f(rest(l))(x)(g))(first(l))(y))
);
const pushs = l => x => fold(l)(ushift(empty)(x))(ushift);
const to_digits = Y(f => n => pushs(
    if_else(is_less_or_equal(n)(pred(two)))
        (empty)
        (x => f(div(n)(two))(x))
    )(mod(n)(two))
)
const mod = Y(f => m => n => 
    if_else(is_less_or_equal(n)(m))
        (x => f(minus(m)(n))(n)(x))
        (m)
);
const range = Y(f => m => n => 
    if_else(is_less_or_equal(m)(n))
        (x => ushift(f(succ(m))(n))(m)(x))
        (empty)
);
const maps = k => f => fold(k)(empty)(l => x => ushift(l)(f(x)));
const twenty = mult(four)(five);

const my_list = maps(range(one)(twenty))(n => 
    if_else(is_zero(mod(n)(succ(five))))(abaa)(
        if_else(is_zero(mod(n)(three)))(aa)(
            if_else(is_zero(mod(n)(two)))(ab)(to_digits(n))
        )
    )        
);

// The above code only uses functions to compconste all calculations, 
// and the calculation result is a single-character linked list

// But the above code does not encode the characters related to the output format, 
// so use an array to store the result to change the output format

const to_array = proc => {
    const arr = [];
    while(to_boolean(is_empty(proc))!='T'){
        arr.push(first(proc));
        proc = rest(proc);
    }
    return arr;
}
const to_string = s => to_array(s).map(c => to_char(c)).join('');
console.log(to_array(my_list).map(v=>to_string(v)));

// If you don’t use arrays, you can also use functions to simulate

const fact = Y(f => n => is_zero(n)(one)(
    x => mult(n)(f(pred(n)))(x)
));

const arr = s => to_char(first(s));
const s1 = to_digits(fact(four));
const s2 = rest(s1);
const s3 = rest(s2);
const s4 = rest(s3);
const s5 = rest(s4);

// console.log(arr(s1) + arr(s2) + arr(s3) + arr(s4) + arr(s5));