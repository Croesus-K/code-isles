import type { CourseDef, LevelDef, RegionDef } from '../course'
import { regionJ5Stub } from './region5'

/**
 * 第二门课程：JavaScript 基础（高效入门版）。
 *
 * 设计目标：让新手最快最高效地掌握 JavaScript 入门——
 * 变量声明、数字/运算、字符串/数组/对象、函数、控制流、错误处理。
 *
 * 节奏：每关 4-5 道题 = 1 选择（理解）+ 1 输出（结果预测）+ 1 填空（写代码）+ 1 改错（找错）。
 * 区域 id 使用 j 前缀（j1/j2/j3/j4），与 Python 课程的 '1'..'5' 在同一份存档中共存互不冲突。
 * 错题本 questionKey = "${regionId}:${levelId}:${qIndex}"，regionId 全局唯一是硬前提。
 */

// ============ j1: 变量码头（let/const/数字） ============

const j1a: LevelDef = {
  id: 'j1-1',
  name: 'let 与 const',
  xp: 30,
  gold: 12,
  learn: {
    title: 'let 与 const：会变与不变的变量',
    body: [
      'JavaScript 用 let 声明「会变」的变量（let x = 1；之后 x = 2 没问题）。用 const 声明「不变」的常量（const pi = 3.14；之后再赋值直接报错）。',
      '新手最容易踩的坑：不写声明符直接赋值（x = 1）会悄悄创建全局变量，污染整个程序。一定要写 let 或 const。',
      'JS 是动态类型：同一个变量今天装数字、明天装字符串都行，赋什么就是什么。和 Python 一样灵活。',
    ],
    code: "let hp = 100          // 会变的值用 let\nconst name = '像素侠'   // 不变的用 const\nhp = hp - 30            // 重新赋值 OK\nconsole.log(`${name} 剩余 HP: ${hp}/100`)",
  },
  questions: [
    {
      kind: 'choice',
      prompt: '下面哪种声明创建的变量，之后不能重新赋值？',
      options: ['let x = 1', 'const x = 1', 'var x = 1', 'x = 1'],
      answerIndex: 1,
      hint: '名字里就带着答案——"常量"的常。',
      explain: 'const 声明的是常量：只能赋值一次，再赋值会抛 TypeError。let 和 var 声明的变量都可以重新赋值。不写声明符（x = 1）会创建全局变量，是大坑。',
    },
    {
      kind: 'output',
      prompt: '运行这段代码会输出什么？',
      code: 'let a = 5\na = a + 2\nconsole.log(a)',
      options: ['输出 5', '输出 7', '输出 52', '报错'],
      answerIndex: 1,
      hint: 'a + 2 是数字相加，不是字符串拼接。',
      explain: 'a 先被赋值 5，再重新赋值为 5 + 2 = 7。let 允许重新赋值，console.log 打印 7。变量"更新"模式在 JS 和 Python 里完全一样。',
    },
    {
      kind: 'fill',
      prompt: '补全声明符，让 hp 之后还能被更新：',
      code: '___ hp = 100\nhp = 80',
      answers: ['let'],
      placeholder: '三个字母',
      hint: '想要"会变"的变量用哪个？',
      explain: 'let 声明的变量可以重新赋值：let hp = 100 之后 hp = 80 没问题。const 声明就不能再改。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会报错？',
      code: ["const name = '像素侠'", "name = '新像素侠'", "console.log(name)"],
      answerLine: 1,
      hint: '谁不允许重新赋值来着？',
      explain: '第 2 行：name 是 const 声明的常量，重新赋值会抛 TypeError: Assignment to constant variable。之后还要改的值请改用 let。这是 JS 最常见的报错之一。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: "const name = '冒险者'\nlet hp = 100\nhp = hp - 30\nconsole.log(`${name} HP: ${hp}/100`)",
      options: [
        '「冒险者 HP: 70/100」',
        '「name HP: hp/100」',
        '「冒险者 HP: 100/100」',
        '报错',
      ],
      answerIndex: 0,
      hint: '模板字符串会把 {} 里的变量替换成值。',
      explain: 'name 是 const 不会变（"冒险者"），hp 是 let 允许更新（从 100 减到 70）。模板字符串 ${} 把变量嵌进字符串，得「冒险者 HP: 70/100」。这是写公告牌、日志的标准写法。',
    },
  ],
}

const j1b: LevelDef = {
  id: 'j1-2',
  name: '数字三兄弟',
  xp: 35,
  gold: 13,
  learn: {
    title: '数字与运算符：+ - * / % **',
    body: [
      'JS 也有整数（10）和小数（3.14），统称 number 类型。',
      '基本运算：+ 加、- 减、* 乘、/ 除（永远是小数）、% 取余数、** 乘方。和 Python 大部分相同。',
      '注意一个坑：`+` 遇上字符串会变成拼接而不是加法：1 + "5" 得 "15" 而不是 6。其他运算符（- * / %）会强制把字符串转回数字。',
    ],
    code: '7 / 2      // → 3.5（小数）\n7 % 2      // → 1（余数）\n2 ** 10    // → 1024（2 的 10 次方）\n1 + "5"    // → "15"（字符串拼接）\n1 - "5"    // → -4（强制转数字）',
  },
  questions: [
    {
      kind: 'choice',
      prompt: '下面哪个运算符能算 2 的 8 次方？',
      options: ['2 ^ 8', '2 ** 8', '2 * 8', '2 // 8'],
      answerIndex: 1,
      hint: '^ 在 JS 里是按位异或，不是次方。',
      explain: '** 是乘方：2 ** 8 = 256。JS 里 ^ 是按位异或（位运算），* 是乘法，// 在 JS 里不是合法语法（JS 用 Math.floor(7/2) 整除）。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: 'console.log(10 / 5)',
      options: ['2', '2.0', '报错', '"10/5"'],
      answerIndex: 0,
      hint: 'console.log 打印的是数字的文本形式。',
      explain: 'console.log(10 / 5) 打印 2（虽然 number 类型内部是 IEEE-754 浮点数，但显示不带 .0）。这跟 Python 不一样：Python 的 10 / 5 直接是 2.0。',
    },
    {
      kind: 'fill',
      prompt: '补全运算符，取 9 除以 4 的余数：',
      code: 'const rem = 9 ___ 4\nconsole.log(rem)   // 想输出 1',
      answers: ['%'],
      placeholder: '取余数',
      hint: '9 除以 4 商 2 余 1。',
      explain: '% 是取余运算符：9 % 4 = 1。/ 拿商、% 拿余数，是两个常分清的搭档。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ['const x = 10', 'const y = x / 0'],
      answerLine: 1,
      hint: 'JS 里除以 0 得什么？',
      explain: '第 2 行：x / 0 不报错，但得 Infinity（无穷大）。再算 Infinity - Infinity 得 NaN（Not a Number），NaN 的传播性强：任何数和 NaN 算都还是 NaN。要检查是不是数字用 isFinite() 或 Number.isNaN()。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: 'console.log(1 + "5")',
      options: ['"15"', '6', '"6"', '报错'],
      answerIndex: 0,
      hint: '字符串 + 数字 → 字符串拼接。',
      explain: '+ 号遇上字符串就变成拼接：1 + "5" 得字符串 "15"，不是数字 6。这是 JS 著名的"加号陷阱"，做表单输入转换时特别容易中招。',
    },
  ],
}

const j1Boss: LevelDef = {
  id: 'j1-B',
  name: '变量码头大测验',
  xp: 90,
  gold: 38,
  boss: true,
  learn: {
    title: 'Boss：变量、模板字符串与运算综合',
    body: [
      '这一关没有新知识。5 道题覆盖 let/const、模板字符串、数字运算 —— 把你前 2 关的东西串起来用。',
      '答错会当场给解析，放心冲。全对零提示才能拿到 ★★★ 和完整战利品。',
    ],
  },
  questions: [
    {
      kind: 'output',
      prompt: '执行后 hp 是多少？',
      code: 'let hp = 100\nhp = hp - 30\nconsole.log(hp)',
      options: ['100', '70', '-30', '130'],
      answerIndex: 1,
      hint: '先算右边，再存回去。',
      explain: '右边的 hp - 30 = 70，再放进 hp 变量。最终 hp = 70。',
    },
    {
      kind: 'fill',
      prompt: '补全声明符，让 pi 是不能改的圆周率：',
      code: '___ pi = 3.14\npi = 3    // 想让这行报错',
      answers: ['const'],
      placeholder: '五个字母',
      hint: '"不能改"的常量用哪个？',
      explain: 'const 声明常量：pi = 3 会抛 TypeError。这是 JS 表达"这是常量，不能改"的标准写法。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行产生了「不符合期望」的结果？（开发者的本意是数字相加）',
      code: ['let x = 1', 'x = "1"', 'console.log(x + 1)'],
      answerLine: 2,
      hint: '注意 x 现在是什么类型。',
      explain: '第 3 行：x 在第 2 行被赋值为字符串 "1"，x + 1 触发字符串拼接得 "11"——不报错但完全不是期望的数字 2。要想加法要先 Number(x) 转回数字。这是 JS 动态类型的双刃剑：变量能装不同类型，但每次用都要想清楚现在是哪个。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: "const name = '冒险者'\nconst hp = 80\nconsole.log(`${name} 剩余 HP: ${hp}/100`)",
      options: [
        '「冒险者 剩余 HP: 80/100」',
        '「name 剩余 HP: hp/100」',
        '「冒险者 剩余 HP: 100/100」',
        '报错',
      ],
      answerIndex: 0,
      hint: '模板字符串 + const。',
      explain: '模板字符串 ${} 把变量替换进字符串，得「冒险者 剩余 HP: 80/100」。两个 const 不允许改，但能拿它们的值来用。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: 'console.log(2 ** 10)',
      options: ['20', '100', '1024', '报错'],
      answerIndex: 2,
      hint: '** 是乘方。',
      explain: '2 ** 10 = 1024（2 的 10 次方）。这是 JS 里算次方的标准写法，写成 2^10 是按位异或，得 8——完全不是一回事。',
    },
  ],
}

const regionJ1: RegionDef = {
  id: 'j1',
  name: '变量码头',
  tagline: '从 let / const 开始的 JS 之旅',
  levels: [j1a, j1b, j1Boss],
}

// ============ j2: 字符串与数组 ============

const j2a: LevelDef = {
  id: 'j2-1',
  name: '字符串方法',
  xp: 38,
  gold: 14,
  learn: {
    title: '字符串方法：大小写、长度、切片',
    body: [
      '字符串在 JS 里是不可变的——所有方法都"返回新字符串"，不改原字符串。',
      '常用方法：.length 取字符数、.toUpperCase()/.toLowerCase() 转大小写、.trim() 去两端空格、.slice(a, b) 切片（含头不含尾）、.includes("x") 是否含子串。',
      '字符串拼接首选模板字符串；老办法 "a" + "b" 也能拼。+ 号遇上字符串永远优先拼接。',
    ],
    code: "const s = '  Hello, World  '\ns.length                  // → 15\ns.toUpperCase()           // → '  HELLO, WORLD  '\ns.trim()                  // → 'Hello, World'\ns.slice(0, 5)             // → 'Hello'\ns.includes('World')       // → true",
  },
  questions: [
    {
      kind: 'choice',
      prompt: '下面哪个能取出字符串的字符个数？',
      options: ['.size', '.length', '.count', 'len()'],
      answerIndex: 1,
      hint: 'JS 里数组和字符串都有它。',
      explain: '.length 是字符串和数组都有的属性。.size 是 Set/Map 的；.count 不是标准；len() 是 Python 的写法，JS 里没这个函数。',
    },
    {
      kind: 'output',
      prompt: '执行后 s 是多少？',
      code: "const s = 'code'\nconsole.log(s.toUpperCase())",
      options: ['"code"', '"CODE"', '"Code"', '报错'],
      answerIndex: 1,
      hint: '.toUpperCase() 返回新字符串。',
      explain: '.toUpperCase() 把每个字符转成大写，得 "CODE"。原字符串 s 没变（不可变），打印的是新字符串。这是字符串方法的"返回新值"原则。',
    },
    {
      kind: 'fill',
      prompt: '补全方法名，去掉字符串两端的空格：',
      code: "const s = '  hello  '\nconst t = s.___()\nconsole.log(t.length)   // 想输出 5",
      answers: ['trim'],
      placeholder: '四个字母',
      hint: '意为"修剪"。',
      explain: '.trim() 去掉字符串首尾的空白字符（空格、换行、制表符）。"  hello  ".trim() 得 "hello"，长度从 9 变成 5。中间的空格不会去掉——只有两端的会。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ["const s = 'hello'", "s[0] = 'H'"],
      answerLine: 1,
      hint: '字符串能被索引赋值吗？',
      explain: '第 2 行：字符串在 JS 里是不可变的，s[0] = "H" 不会报错（严格模式除外）但也没效果。要改字符串用 .replace() 或 .toUpperCase() 之类返回新值的方法。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: "console.log('Hello, World'.slice(0, 5))",
      options: ['"Hello"', '"Hello,"', '" World"', '报错'],
      answerIndex: 1,
      hint: '切片含头不含尾。',
      explain: '.slice(0, 5) 取索引 0 到 5 之前：得 "Hello,"（含逗号）。切片规则和 Python 一样——含头不含尾。',
    },
  ],
}

const j2b: LevelDef = {
  id: 'j2-2',
  name: '数组基础',
  xp: 40,
  gold: 14,
  learn: {
    title: '数组：一串宝物的容器',
    body: [
      '数组用方括号 [] 创建，元素之间用逗号分隔。和 Python 不同，JS 数组里的元素类型可以混搭（数字 + 字符串 + 对象都可以）。',
      '索引也是从 0 开始：arr[0] 是第一个，arr[arr.length - 1] 是最后一个。访问不存在的索引返回 undefined（不会报错）。',
      '.length 拿元素个数；.includes(item) 查元素是否在数组里（和字符串的 .includes 用法一样）。',
    ],
    code: "const items = ['剑', '盾', '药水']\nitems[0]                  // → '剑'\nitems[items.length - 1]  // → '药水'（最后一个）\nitems.length              // → 3\nitems[5]                  // → undefined（越界不报错）\nitems.includes('盾')      // → true",
  },
  questions: [
    {
      kind: 'choice',
      prompt: 'JS 数组和 Python 列表相比，最大的区别是？',
      options: [
        'JS 数组必须存同一类型',
        'JS 数组能混搭不同类型的元素',
        'JS 数组没有索引',
        'JS 数组必须用 {} 写',
      ],
      answerIndex: 1,
      hint: 'JS 是动态类型语言。',
      explain: 'JS 数组可以混搭：[1, "hello", {name: "x"}, [2]] 完全合法。Python 列表虽然也能混搭，但 JS 里这种用法更普遍，因为 JS 数组常用来装不同类型的数据。',
    },
    {
      kind: 'output',
      prompt: '执行后 bag 是多少？',
      code: "const bag = ['剑', '盾', '药水']\nconsole.log(bag[bag.length - 1])",
      options: ['"剑"', '"盾"', '"药水"', 'undefined'],
      answerIndex: 2,
      hint: 'bag.length - 1 是几？',
      explain: 'bag.length = 3，bag.length - 1 = 2，bag[2] = "药水"。这是 JS 拿"最后一个元素"的标准写法，比硬写 bag[2] 更通用。',
    },
    {
      kind: 'fill',
      prompt: '补全方法名，判断数组是否含"药水"：',
      code: "const bag = ['剑', '盾', '药水']\nconst hasPotion = bag.___('药水')",
      answers: ['includes'],
      placeholder: '八个字母',
      hint: '意为"包含"。',
      explain: '.includes(item) 判断元素是否在数组里，返回 true/false。和字符串的 .includes 用法一样。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ["const bag = []", "console.log(bag[0].toUpperCase())"],
      answerLine: 1,
      hint: '空数组的 bag[0] 是几？',
      explain: '第 2 行：bag[0] 在空数组上访问得 undefined，对 undefined 调 .toUpperCase() 抛 TypeError: Cannot read properties of undefined。访问前要先检查元素是否存在：if (bag[0]) { ... }。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: "const arr = [1, 2, 3]\nconsole.log(arr[5])",
      options: ['undefined', '5', '报错', 'null'],
      answerIndex: 0,
      hint: 'JS 数组越界返回什么？',
      explain: 'JS 数组访问越界返回 undefined，不报错。和 Python 的 IndexError 不同——JS 更宽容，但代价是可能藏 bug。检查元素是否存在要写 if (arr[5] !== undefined)。',
    },
  ],
}

const j2c: LevelDef = {
  id: 'j2-3',
  name: '数组增删',
  xp: 42,
  gold: 15,
  learn: {
    title: '数组增删：push / pop / shift / unshift / splice',
    body: [
      'push(item) 在末尾追加一个元素；pop() 弹出末尾的元素并返回它。',
      'unshift(item) 在开头插入；shift() 弹出开头的元素。这两个比 push/pop 慢，因为要移动所有元素。',
      'splice(start, deleteCount, ...items) 是个瑞士军刀：能删除（不传 items）、插入（deleteCount 传 0）、替换（同时传 deleteCount 和 items）。',
    ],
    code: "const bag = ['剑', '盾']\nbag.push('药水')            // bag → ['剑', '盾', '药水']\nbag.pop()                   // → '药水'，bag → ['剑', '盾']\nbag.unshift('弓')           // bag → ['弓', '剑', '盾']\nbag.shift()                 // → '弓'，bag → ['剑', '盾']\nbag.splice(1, 1, '枪')      // bag → ['剑', '枪']（替换索引 1）",
  },
  questions: [
    {
      kind: 'fill',
      prompt: '补全方法名，在数组末尾添加"盾"：',
      code: "const bag = ['剑']\nbag.___('盾')\nconsole.log(bag.length)   // 想输出 2",
      answers: ['push'],
      placeholder: '四个字母',
      hint: '意为"推入"末尾。',
      explain: '.push(item) 在数组末尾追加一个元素。push/pop 是数组最常用的"栈"操作——一头进一头出，O(1) 时间。',
    },
    {
      kind: 'output',
      prompt: '执行后 bag 和 taken 分别是？',
      code: "const bag = ['剑', '盾', '药水']\nconst taken = bag.pop()",
      options: [
        "bag=['剑', '盾', '药水'], taken=undefined",
        "bag=['剑', '盾'], taken='药水'",
        "bag=['药水'], taken='剑'",
        '报错',
      ],
      answerIndex: 1,
      hint: 'pop 弹出末尾元素。',
      explain: '.pop() 弹出末尾元素并返回它。taken 拿到 "药水"，bag 变成 ["剑", "盾"]。原数组被修改了。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ["const bag = []", "const item = bag.pop()", "console.log(item.toUpperCase())"],
      answerLine: 2,
      hint: '空数组 pop 出来的是什么？',
      explain: '第 3 行：空数组 pop() 得 undefined，对 undefined 调 .toUpperCase() 抛 TypeError。空数组操作后要先检查：if (item) { ... } 或用默认值 const item = bag.pop() ?? ""。',
    },
    {
      kind: 'output',
      prompt: '执行后 bag 是？',
      code: "const bag = ['剑', '盾', '药水']\nbag[1] = '弓'\nconsole.log(bag)",
      options: [
        "['剑', '弓', '药水']",
        "['弓', '盾', '药水']",
        "['剑', '盾', '药水', '弓']",
        '报错',
      ],
      answerIndex: 0,
      hint: '给数组索引赋值是改还是加？',
      explain: 'bag[1] = "弓" 把索引 1 替换成 "弓"，数组长度不变。这是"原地修改"，不会增加元素。要新增元素用 .push() 或 .splice()。',
    },
    {
      kind: 'order',
      prompt: '把这几行排成正确顺序，最后 bag = ["弓", "剑"]：',
      lines: [
        "const bag = []",
        "bag.push('剑')",
        "bag.unshift('弓')",
        "console.log(bag)",
      ],
      hint: '先建空数组，再 push，再 unshift。',
      explain: '先 [] 建空数组，push("剑") 得 ["剑"]，unshift("弓") 把 "弓" 插到开头，得 ["弓", "剑"]。unshift 是"在头部插入"，push 是"在尾部追加"。',
    },
  ],
}

const j2Boss: LevelDef = {
  id: 'j2-B',
  name: '字符串与数组大测验',
  xp: 110,
  gold: 48,
  boss: true,
  learn: {
    title: 'Boss：字符串方法 + 数组综合',
    body: [
      '这一关没有新知识。6 道题覆盖字符串方法（大小写、切片、长度）、数组创建/索引/增删——把你前 3 关串起来。',
      '答错会当场给解析，放心冲。全对零提示才能拿到 ★★★ 和完整战利品。',
    ],
  },
  questions: [
    {
      kind: 'output',
      prompt: '执行后 output 是多少？',
      code: "const s = '  code  '\nconsole.log(s.trim().toUpperCase())",
      options: ['"CODE"', '"code"', '"  CODE  "', '"  code  "'],
      answerIndex: 0,
      hint: '链式调用：先 trim，再 toUpperCase。',
      explain: '"  code  ".trim() 得 "code"，再 .toUpperCase() 得 "CODE"。方法链式调用是 JS 字符串和数组的招牌，每个方法返回新对象，就可以接着调下一个。',
    },
    {
      kind: 'fill',
      prompt: '补全方法名，把字符串按旧方法拆成数组：',
      code: "const s = 'a,b,c'\nconst arr = s.___(',')",
      answers: ['split'],
      placeholder: '五个字母',
      hint: '意为"分割"。',
      explain: '.split(",") 按逗号把字符串切成数组 ["a", "b", "c"]。这是字符串转数组的标准方法（Python 里叫 .split() 但 JS 用这个函数名）。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ["const bag = ['剑', '盾']", "bag.push('药水')", "bag[5] = '弓'"],
      answerLine: 2,
      hint: '数组越界赋值会怎样？',
      explain: '第 3 行：JS 数组赋值越界时中间会留出"空槽"（sparse array）。bag 会变成 ["剑", "盾", "药水", empty × 2, "弓"]。length 变 6，但中间两个是 undefined。一般别这么写，直接用 push 或 splice 更安全。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const nums = [1, 2, 3, 4, 5]\nconsole.log(nums.slice(1, 4))",
      options: ['[1, 2, 3, 4]', '[2, 3, 4]', '[2, 3, 4, 5]', '[1, 2, 3, 4, 5]'],
      answerIndex: 1,
      hint: '切片含头不含尾。',
      explain: 'nums.slice(1, 4) 取索引 1 到 4 之前：[2, 3, 4]。和 Python 的 [1:4] 一样含头不含尾。slice 不改原数组，返回新数组。',
    },
    {
      kind: 'output',
      prompt: '执行后 bag 是？',
      code: "const bag = ['剑', '盾', '药水']\nbag.splice(1, 0, '弓')\nconsole.log(bag)",
      options: [
        "['剑', '弓', '盾', '药水']",
        "['剑', '盾', '药水', '弓']",
        "['弓', '剑', '盾', '药水']",
        '报错',
      ],
      answerIndex: 0,
      hint: 'splice(start, deleteCount, item) 中间参数 0 表示什么？',
      explain: '.splice(1, 0, "弓") 在索引 1 处插入 "弓"，删除 0 个元素——结果是 ["剑", "弓", "盾", "药水"]。这是数组"中间插入"的标准写法，比 unshift + 排序高效得多。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const tags = ['剑', '盾']\nconsole.log(tags.includes('药水'))",
      options: ['true', 'false', 'undefined', '报错'],
      answerIndex: 1,
      hint: '数组里有没有"药水"？',
      explain: '数组里只有 "剑" 和 "盾"，没有 "药水"，所以 .includes() 返回 false。这是布尔值判断的标准工具，常用于 if 检查：if (tags.includes("药水")) { ... }。',
    },
  ],
}

const regionJ2: RegionDef = {
  id: 'j2',
  name: '字符串与数组',
  tagline: '把数据和文字排排坐',
  levels: [j2a, j2b, j2c, j2Boss],
}

// ============ j3: 分支与循环 ============

const j3a: LevelDef = {
  id: 'j3-1',
  name: 'if / else 岔路',
  xp: 40,
  gold: 14,
  learn: {
    title: 'if / else：岔路口的路标',
    body: [
      'JS 的 if 结构和 Python 几乎一样：if 后写条件，条件成立就跑缩进里的代码。',
      '注意 JS 用 { } 包住代码块（不用 Python 的缩进）。{} 是语法的一部分，少一个都不行。',
      '三元运算符 ? : 是 if/else 的简写：condition ? a : b 条件成立取 a，否则取 b。一行写完常用于赋值。',
    ],
    code: "const score = 75\nif (score >= 60) {\n    console.log('及格')\n} else {\n    console.log('加油')\n}\nconst tag = score >= 90 ? '优秀' : '普通'  // 三元运算符",
  },
  questions: [
    {
      kind: 'choice',
      prompt: 'JS 里 if 后的条件必须包在什么符号里？',
      options: ['方括号 []', '圆括号 ()', '花括号 {}', '尖括号 <>'],
      answerIndex: 1,
      hint: 'JS 里 if 条件用「小括号」。',
      explain: 'JS 里 if (condition) 必须有圆括号；花括号 {} 包住代码块。Python 都不用（小括号花括号都省），初学者容易混。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: "const hp = 50\nif (hp > 0) {\n    console.log('alive')\n}",
      options: ['alive', '什么都不输出', 'dead', '报错'],
      answerIndex: 0,
      hint: '50 > 0 成立吗？',
      explain: 'hp = 50 > 0 成立，打印 "alive"。if 条件为真就执行花括号里的代码，否则跳过。',
    },
    {
      kind: 'fill',
      prompt: '补全关键字，剩 hp <= 0 时输出 "dead"：',
      code: 'if (hp > 0) {\n    console.log("alive")\n} ___ {\n    console.log("dead")\n}',
      answers: ['else'],
      placeholder: '四个字母',
      hint: '「其余情况」用哪个？',
      explain: 'else 是「否则」分支：前面条件不成立就跑 else 块。JS 里的 if/else 和 Python 语义完全一样。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会报错？',
      code: [
        "const x = 10",
        "if x > 5 {",
        "    console.log('big')",
        '}',
      ],
      answerLine: 1,
      hint: 'if 后面少了什么？',
      explain: '第 2 行：JS 里 if 条件必须有圆括号包住：if (x > 5) {。漏掉 ( ) 会直接 SyntaxError。',
    },
    {
      kind: 'output',
      prompt: '执行后 msg 是？',
      code: "const score = 75\nconst msg = score >= 60 ? 'pass' : 'fail'",
      options: ['"pass"', '"fail"', 'undefined', '报错'],
      answerIndex: 0,
      hint: '三元运算符：条件 ? 真值 : 假值。',
      explain: '75 >= 60 成立，三元运算符取 "pass"。三元运算符是 if/else 的简写，适合赋值场景。',
    },
  ],
}

const j3b: LevelDef = {
  id: 'j3-2',
  name: '比较与逻辑',
  xp: 42,
  gold: 15,
  learn: {
    title: '比较与逻辑：== / === / && / || / !',
    body: [
      'JS 有一套特别容易出错的比较运算符：== 是松散相等（"5" == 5 是 true，会自动转类型），=== 是严格相等（"5" === 5 是 false，类型不同）。',
      '新手建议：永远用 === 和 !==，不用 == 和 !=，避免类型转换带来的坑。',
      '逻辑运算符：&&（与）两边都真才真，||（或）一边真就真，!（非）翻转。短路求值：a && b 如果 a 是假就返回 a，否则返回 b。',
    ],
    code: '5 === 5       // → true（严格相等，类型和值都看）\n"5" === 5     // → false（类型不同）\n"5" == 5      // → true（松散相等，会转换）\ntrue && false // → false\ntrue || false // → true\n!true         // → false',
  },
  questions: [
    {
      kind: 'choice',
      prompt: '新手应该优先用哪个等号运算符？',
      options: ['==', '===', '=', '!='],
      answerIndex: 1,
      hint: '「严格相等」更安全。',
      explain: '=== 是严格相等，比较类型和值；== 会自动转类型（如 "5" == 5 为 true）。新手坑大多来自 ==，所以默认用 ===。= 是赋值符号。',
    },
    {
      kind: 'output',
      prompt: '执行后 result 是？',
      code: "console.log('5' === 5)",
      options: ['true', 'false', '报错', '"5"'],
      answerIndex: 1,
      hint: '严格相等比较类型和值。',
      explain: '"5" === 5：字符串和数字，类型不同，=== 返回 false。这是 JS 严格相等的标准行为。',
    },
    {
      kind: 'fill',
      prompt: '补全运算符，让两个变量都为 true 时输出 "ok"：',
      code: "if (a ___ b) {\n    console.log('ok')\n}",
      answers: ['&&'],
      placeholder: '两个符号',
      hint: '「两边都真」用哪个？',
      explain: '&& 是逻辑与：两边都为 true 才为 true。a && b 等价于 a and b。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ["const x = null", "if (x.toUpperCase()) {", "    console.log('hi')", '}', 'console.log("end")'],
      answerLine: 1,
      hint: 'null 上能调方法吗？',
      explain: '第 2 行：x 是 null，调 .toUpperCase() 抛 TypeError: Cannot read properties of null。访问前要判断：if (x && x.toUpperCase()) { ... }。第 4 行的 end 也打印不出来，因为第 2 行异常中断了程序。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const x = 0\nconsole.log(x || 'default')",
      options: ['0', '"default"', 'true', '报错'],
      answerIndex: 1,
      hint: '|| 是短路求值。',
      explain: 'x = 0 是 falsy 值（除了 null/undefined/0/""/false/NaN 都是 falsy），所以 || 返回右边的 "default"。这是 JS 写"默认值"的常用模式：const v = input || defaultVal。但要注意：0 和空字符串也会触发"默认值"，需要时改用 ??（空值合并）。',
    },
  ],
}

const j3c: LevelDef = {
  id: 'j3-3',
  name: 'for / while 循环',
  xp: 45,
  gold: 16,
  learn: {
    title: 'for / while：让代码重复跑',
    body: [
      'JS 有三种循环：for (init; cond; step) {} 是经典写法（和 C/Java 一脉相承），while (cond) {} 是条件循环，for...of 是遍历数组（类似 Python 的 for x in arr）。',
      'break 跳出整个循环；continue 跳过本轮继续下一轮。注意 for...of 不能用 continue 跳到"下一个数组"——只能跳当前数组的下一项。',
      '经典累加器模式：sum = 0; for (let i = 0; i < n; i++) { sum += i }，求 0 到 n-1 的和。',
    ],
    code: "for (let i = 0; i < 3; i++) {\n    console.log(i)   // 输出 0、1、2\n}\n\nlet n = 0\nwhile (n < 3) {\n    console.log(n)\n    n++              // 别忘改条件，否则死循环\n}\n\nconst arr = ['a', 'b', 'c']\nfor (const x of arr) {\n    console.log(x)   // 输出 a、b、c\n}",
  },
  questions: [
    {
      kind: 'fill',
      prompt: '补全代码：让 i 从 0 跑到 4（每次加 1）：',
      code: 'for (let i = 0; i ___ 5; i++) {\n    console.log(i)\n}',
      answers: ['<'],
      placeholder: '一个符号',
      hint: '想 i < 5 时一直跑。',
      explain: 'for (let i = 0; i < 5; i++) 是「从 0 开始，到 5 之前停，每次 +1」。for 的三个表达式分别管：起点、终点、步长。',
    },
    {
      kind: 'output',
      prompt: '执行后 sum 是？',
      code: 'let sum = 0\nfor (let i = 1; i <= 4; i++) {\n    sum += i\n}\nconsole.log(sum)',
      options: ['6', '10', '4', '报错'],
      answerIndex: 1,
      hint: '1+2+3+4 = ?',
      explain: '1+2+3+4 = 10。i <= 4 是「包含 4」，所以加到 4。这是累加器模式，循环里最常见的"求和"写法。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ['let n = 0', 'while (n < 3) {', '    console.log(n)', '}', 'console.log("end")'],
      answerLine: 2,
      hint: 'n 一直没变，会发生什么？',
      explain: '第 3 行只 print 没改 n，n 永远等于 0，循环条件 n<3 永远成立——无限循环。得加一行 n++ 才能退出。while 循环最容易出这个错：忘了在循环体里改条件。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "for (let i = 0; i < 5; i++) {\n    if (i === 3) break\n    console.log(i)\n}",
      options: ['0 1 2 3 4', '0 1 2 3', '0 1 2', '0 1 2 4'],
      answerIndex: 2,
      hint: 'break 让 i=3 整轮都跳过。',
      explain: 'i=3 时 break 触发，整个循环退出。所以只输出 0、1、2。注意 break 是「中断整个循环」，continue 才是「跳过本轮」。',
    },
    {
      kind: 'order',
      prompt: '把这些行排成正确顺序，最后打印 0、1、2：',
      lines: [
        'let n = 0',
        'while (n < 3) {',
        '    console.log(n)',
        '    n++',
        '}',
      ],
      hint: '初始化、条件、循环体、改条件。',
      explain: 'while 循环的标准顺序：先声明 n = 0，再写 while 条件 (n < 3)，循环体里 print，最后改 n 让条件不成立。否则死循环。',
    },
  ],
}

const j3Boss: LevelDef = {
  id: 'j3-B',
  name: '分支循环大测验',
  xp: 120,
  gold: 50,
  boss: true,
  learn: {
    title: 'Boss：分支 + 循环综合',
    body: [
      '这一关没有新知识。6 道题覆盖 if/else、比较 ===、&& || !、for / while / break / continue——把前 3 关串起来。',
      '答错会当场给解析，放心冲。全对零提示才能拿到 ★★★ 和完整战利品。',
    ],
  },
  questions: [
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const n = 7\nconsole.log(n % 2 === 0 ? 'even' : 'odd')",
      options: ['"even"', '"odd"', 'undefined', '报错'],
      answerIndex: 1,
      hint: '7 % 2 是几？',
      explain: '7 % 2 = 1（奇数），所以三元运算符取 "odd"。这是写奇偶判断的经典一行写法。',
    },
    {
      kind: 'fill',
      prompt: '补全运算符，score >= 60 且 score < 90 才输出 "ok"：',
      code: 'if (score >= 60 ___ score < 90) {\n    console.log("ok")\n}',
      answers: ['&&'],
      placeholder: '两个符号',
      hint: '「两边都满足」用哪个？',
      explain: '&& 是「与」：score >= 60 且 score < 90 都成立才执行。这相当于 Python 的 and。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: [
        'let sum = 0',
        'for (let i = 0; i < 5; i++) {',
        '    sum + i',
        '}',
        'console.log(sum)',
      ],
      answerLine: 2,
      hint: 'sum + i 和 sum += i 一样吗？',
      explain: '第 3 行：sum + i 是「加出结果但不存回 sum」。要更新 sum 必须用 sum += i 或 sum = sum + i。算完不存是新手最常见的循环 bug。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "for (let i = 0; i < 6; i++) {\n    if (i % 2 === 0) continue\n    console.log(i)\n}",
      options: ['0 1 2 3 4 5', '1 3 5', '0 2 4', '1 2 3 4 5'],
      answerIndex: 1,
      hint: '偶数被 continue 跳过了。',
      explain: 'i 是偶数（0、2、4）时 continue 触发，跳过本轮的 console.log；i 是奇数（1、3、5）正常打印。所以输出 1、3、5。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "let count = 0\nfor (const x of [1, 2, 3, 4]) {\n    count = count + x\n}\nconsole.log(count)",
      options: ['4', '10', '1234', '报错'],
      answerIndex: 1,
      hint: 'for...of 遍历数组每一项累加。',
      explain: 'for (const x of [1,2,3,4]) 依次把 1、2、3、4 累加进 count：0+1+2+3+4=10。这是遍历数组求和的标准写法，比传统 for 循环更易读。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const x = null\nconsole.log(x ?? 'empty')",
      options: ['null', '"empty"', 'undefined', '报错'],
      answerIndex: 1,
      hint: '?? 是空值合并。',
      explain: '?? 只在左侧是 null 或 undefined 时才返回右侧值。null ?? "empty" = "empty"。和 || 不同：0 ?? "default" = 0（不是 "default"）。需要"只在 null/undefined 时给默认值"就用 ??。',
    },
  ],
}

const regionJ3: RegionDef = {
  id: 'j3',
  name: '分支与循环',
  tagline: '让代码学会做决定',
  levels: [j3a, j3b, j3c, j3Boss],
}

// ============ j4: 对象、函数与异常（毕业区域） ============

const j4a: LevelDef = {
  id: 'j4-1',
  name: '对象基础',
  xp: 45,
  gold: 16,
  learn: {
    title: '对象：键值对的容器',
    body: [
      'JS 对象用花括号 { } 创建，键值对之间用逗号分隔。键是字符串或 Symbol，值可以是任何类型（数字、字符串、数组、函数、嵌套对象）。',
      '访问属性：obj.key 或 obj["key"]。后者支持动态键名、含空格的键名。',
      '对象的方法其实就是值是函数的属性：obj.greet = function() { ... }。调用时 obj.greet()。',
    ],
    code: "const player = {\n    name: '像素侠',\n    hp: 100,\n    items: ['剑', '盾'],\n    greet() { console.log(`Hi, ${this.name}`) }\n}\nplayer.name              // → '像素侠'\nplayer['hp']             // → 100\nplayer.greet()           // → Hi, 像素侠",
  },
  questions: [
    {
      kind: 'choice',
      prompt: 'JS 对象用什么符号创建？',
      options: ['[]', '()', '{}', '<>'],
      answerIndex: 2,
      hint: '键值对的容器。',
      explain: 'JS 对象用花括号 {} 创建：{ key: value, ... }。[] 是数组，() 是函数调用，<> 不是合法语法。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const p = { name: '像素侠', hp: 100 }\nconsole.log(p['name'])",
      options: ['"像素侠"', '"hp"', 'undefined', '报错'],
      answerIndex: 0,
      hint: '[] 里是字符串。',
      explain: 'p["name"] = "像素侠"。方括号访问等价于 p.name，但能用变量当键：const k = "name"; p[k]。',
    },
    {
      kind: 'fill',
      prompt: '补全方法名，删除对象的某个属性：',
      code: "const p = { name: 'x', hp: 100 }\n___ p.hp",
      answers: ['delete'],
      placeholder: '六个字母',
      hint: '意为"删除"。',
      explain: 'delete obj.prop 删除对象的属性。delete p.hp 后 p 变成 { name: "x" }。这是 JS 对象独有的"动态删除"，Python 的 dict 没有等价操作。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: ["const p = { name: 'x' }", "console.log(p.age.toUpperCase())"],
      answerLine: 1,
      hint: 'p.age 不存在。',
      explain: '第 2 行：p.age 是 undefined，undefined.toUpperCase() 抛 TypeError。访问嵌套属性前要逐层判断：if (p.age && p.age.toUpperCase()) { ... }。或者用可选链 ?.：p.age?.toUpperCase()，不存在就返回 undefined。',
    },
    {
      kind: 'output',
      prompt: '执行后 keys 是？',
      code: "const p = { a: 1, b: 2, c: 3 }\nconst keys = Object.keys(p)\nconsole.log(keys.length)",
      options: ['3', '6', '"a,b,c"', '报错'],
      answerIndex: 0,
      hint: 'Object.keys 返回所有键名。',
      explain: 'Object.keys(p) 返回 ["a", "b", "c"]，长度 3。这是遍历对象所有键名的标准写法（用 for...of 或 .map 处理）。',
    },
  ],
}

const j4b: LevelDef = {
  id: 'j4-2',
  name: '函数 def',
  xp: 50,
  gold: 18,
  learn: {
    title: '函数：把代码包成匣子',
    body: [
      'JS 函数用 function 函数名() { ... } 或 const fn = () => { ... }（箭头函数）两种写法。',
      '参数放在 ( ) 里，可以给默认值：function f(x = 10) { }。调用时 f(5) 走 5，没传时走 10。',
      '返回值用 return。函数不写 return 就返回 undefined。箭头函数一行能简写成 () => x * 2（隐式返回 x*2）。',
    ],
    code: "function add(a, b) {\n    return a + b\n}\n\nconst sub = (a, b) => a - b\n\nfunction greet(name = '冒险者') {\n    return `Hello, ${name}`\n}\n\nadd(3, 5)        // → 8\nsub(10, 4)       // → 6\ngreet()          // → 'Hello, 冒险者'",
  },
  questions: [
    {
      kind: 'choice',
      prompt: '箭头函数 () => x * 2 怎么理解？',
      options: [
        '一个参数都没有',
        '一个参数 x，返回 x*2',
        '两个参数 x 和 2',
        '匿名函数',
      ],
      answerIndex: 1,
      hint: '看箭头左边的参数。',
      explain: 'x => x * 2 是「参数 x，返回 x*2」。括号 () 表示无参：() => expr。一个参数时 x 不用括号；多参数要加 (a, b) => ...。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "function f(x = 10) { return x }\nconsole.log(f())",
      options: ['undefined', '10', '报错', '0'],
      answerIndex: 1,
      hint: '没传参数就用默认值。',
      explain: 'f() 没传参，默认参数 x = 10 起作用，返回 10。默认值是 ES6 才有的语法，写在参数声明里 = default。',
    },
    {
      kind: 'fill',
      prompt: '补全关键字，让函数返回 a + b：',
      code: 'function add(a, b) {\n    ___ a + b\n}',
      answers: ['return'],
      placeholder: '六个字母',
      hint: '「返回」结果用哪个？',
      explain: 'return 把结果送回调用方。不写 return 的函数返回 undefined。多行函数体必须有 return 和花括号。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: [
        "function f() {",
        "    'hello'",
        "}",
        "console.log(f().toUpperCase())",
      ],
      answerLine: 3,
      hint: 'f() 返回什么？',
      explain: '第 4 行：函数 f 没写 return，返回 undefined。undefined.toUpperCase() 抛 TypeError。函数体里要写 return 才能把结果送出去。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const f = (a, b) => a + b\nconsole.log(f(3, 4))",
      options: ['7', '"34"', '"7"', '报错'],
      answerIndex: 0,
      hint: '箭头函数一行写法。',
      explain: 'const f = (a, b) => a + b 是箭头函数的简写（隐式 return）。f(3, 4) 直接算 3 + 4 = 7，return 给调用方。',
    },
  ],
}

const j4c: LevelDef = {
  id: 'j4-3',
  name: '作用域与闭包',
  xp: 55,
  gold: 20,
  learn: {
    title: '作用域与闭包：函数能「记住」外面的变量',
    body: [
      '作用域：let/const 在花括号 {} 内声明，外面的 {} 块访问不到。块内可以读块外的，反过来不行。',
      '闭包：函数能「捕获」它定义时所在作用域的变量。即使那个作用域的代码跑完了，函数里还能用那些变量——这就是闭包。',
      '用途：封装私有变量、计数器、记忆化等。闭包也是 JS 异步（setTimeout、回调）能拿到外层变量的根本原因。',
    ],
    code: 'function makeCounter() {\n    let n = 0\n    return () => {\n        n++\n        return n\n    }\n}\nconst c = makeCounter()\nc()   // → 1\nc()   // → 2\nc()   // → 3',
  },
  questions: [
    {
      kind: 'choice',
      prompt: 'let 声明的变量作用域是什么？',
      options: ['整个文件', '当前函数', '当前花括号块', '整个 script 标签'],
      answerIndex: 2,
      hint: '比 var 严格。',
      explain: 'let 是块作用域：只在当前 {} 块内有效。块结束就访问不到。var 是函数作用域（整个函数都能用），const 和 let 同是块作用域。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "function f() {\n    let n = 5\n    return n\n}\nconsole.log(n)",
      options: ['5', 'undefined', '报错', '0'],
      answerIndex: 2,
      hint: 'n 在外面访问不到。',
      explain: 'let n = 5 在 f 函数 {} 内声明，块外访问会抛 ReferenceError: n is not defined。这是块作用域的规则：内层变量外层用不到。',
    },
    {
      kind: 'fill',
      prompt: '补全方法名，让内层函数能记住 n 的值：',
      code: "function make() {\n    let n = 0\n    return () => { ___ }\n}",
      answers: ['n++'],
      placeholder: '两个符号',
      hint: '想 n 每次加 1。',
      explain: 'return () => { n++ } 里的箭头函数能访问 make 的 n，每次调用都让 n 自增。这就是「闭包」：内层函数 + 外层变量 = 一个有记忆的小工具。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行藏着新手最容易踩的坑？（代码能跑，但不是你以为的结果）',
      code: [
        'function f() {',
        '    var x = 1',
        '    if (true) {',
        '        var x = 2',
        '    }',
        '    return x',
        '}',
      ],
      answerLine: 3,
      hint: 'var 是函数作用域。',
      explain: '第 4 行的 var x = 2 看着像「在 if 块内重新声明」，实际和外面的 var x 是同一个 x（只是重新赋值）。var 没有块作用域，if 块结束不影响 var。所以 f() 返回 2 而不是 1。新手建议默认用 let/const，忘掉 var。',
    },
    {
      kind: 'output',
      prompt: '执行后 c() 是？',
      code: "function make() {\n    let n = 0\n    return () => { n++; return n }\n}\nconst c = make()\nc()",
      options: ['0', '1', '2', '报错'],
      answerIndex: 1,
      hint: 'c() 是内层箭头函数。',
      explain: 'c = make() 拿到内层箭头函数（已经捕获了 n = 0）。c() 调一次：n++ 让 n 变 1，再 return n 输出 1。这是计数器模式：make() 每次返回独立的计数器。',
    },
  ],
}

const j4d: LevelDef = {
  id: 'j4-4',
  name: '异常处理',
  xp: 55,
  gold: 20,
  learn: {
    title: 'try / catch：处理出错的代码',
    body: [
      'JS 异常处理和 Python 类似：try 包住可能出错的代码，catch 接住抛出的错误。',
      'throw new Error("消息") 主动抛出错误。错误对象有 .message 字段。',
      'finally 不管 try 成不成功都会跑，常用于清理（关文件、关网络连接）。',
    ],
    code: "try {\n    const x = JSON.parse('not json')\n    console.log(x)\n} catch (e) {\n    console.log('解析失败:', e.message)\n} finally {\n    console.log('清理工作')\n}",
  },
  questions: [
    {
      kind: 'choice',
      prompt: 'try/catch/finally 哪个块最常用于「无论是否出错都执行清理」？',
      options: ['try', 'catch', 'finally', 'throw'],
      answerIndex: 2,
      hint: '意为「最后」。',
      explain: 'finally 不管 try 出没出错都会跑。catch 只有出错才跑。try 是「尝试」的代码块。throw 是「主动抛错」。finally 是清理代码的家。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "try {\n    throw new Error('boom')\n} catch (e) {\n    console.log(e.message)\n}",
      options: ['Error', '"boom"', 'undefined', '报错'],
      answerIndex: 1,
      hint: 'e.message 是错误消息。',
      explain: 'throw new Error("boom") 抛出错误对象，e 接住后 e.message = "boom"。这是自定义错误消息的标准模式。',
    },
    {
      kind: 'fill',
      prompt: '补全关键字，主动抛出一个错误：',
      code: "if (age < 0) {\n    ___ new Error('年龄不能为负')\n}",
      answers: ['throw'],
      placeholder: '五个字母',
      hint: '意为「抛出」。',
      explain: 'throw new Error("msg") 主动抛出一个错误对象。catch 接住后 e.message 能拿到 "年龄不能为负"。这是参数校验的标准写法。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会出问题？',
      code: [
        'try {',
        '    const x = null',
        '    console.log(x.toUpperCase())',
        '}',
      ],
      answerLine: 2,
      hint: 'try 块里出错没人接。',
      explain: '第 3 行 x.toUpperCase() 抛 TypeError: Cannot read properties of null——但没 catch 接住，错误冒泡到最外层，最终抛 Uncaught TypeError。这是 JS 默认行为：try 包住的代码出错而没 catch，错误会传到全局。所以 try 和 catch 必须配对使用。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "try {\n    console.log('try')\n} finally {\n    console.log('finally')\n}",
      options: ['"try"', '"finally"', '"try" "finally"', '报错'],
      answerIndex: 2,
      hint: 'try 跑、finally 也跑。',
      explain: 'try 里的 console.log("try") 跑一次，finally 里的 console.log("finally") 不管 try 出没出错都跑。所以输出 "try" 和 "finally"。',
    },
  ],
}

const j4Boss: LevelDef = {
  id: 'j4-B',
  name: '毕业总测验',
  xp: 150,
  gold: 60,
  boss: true,
  learn: {
    title: 'Boss：对象 / 闭包 / 函数 / 异常 综合',
    body: [
      'JS 入门收官战。6 道题把对象、函数、闭包、异常处理串起来。',
      '全对零提示才能拿到 ★★★ 和完整战利品。这是入门通关的最后一关。',
    ],
  },
  questions: [
    {
      kind: 'output',
      prompt: '执行后 player.hp 是？',
      code: "const player = { name: 'x', hp: 100 }\ndelete player.hp\nconsole.log(player.hp)",
      options: ['100', 'undefined', 'null', '报错'],
      answerIndex: 1,
      hint: 'delete 后属性没了。',
      explain: 'delete player.hp 删除 hp 属性，访问时返回 undefined。这是 JS 对象独有的"动态删除"，访问一个不存在的属性永远返回 undefined（不报错）。',
    },
    {
      kind: 'fill',
      prompt: '补全关键字，让内层函数能"记住"外层变量：',
      code: "function make() {\n    let n = 0\n    return () => { ___ n + 1 }\n}",
      answers: ['return'],
      placeholder: '六个字母',
      hint: '「返回」n + 1。',
      explain: 'return n + 1 把当前 n + 1 的结果送回调用方。这是计数器模式的标准写法：make() 返回的函数会捕获外层 n，每次调用 n 都自增。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会抛错？（即使被 catch 接住，错误仍从这一行发出）',
      code: [
        "const o = { name: 'x' }",
        'try {',
        "    console.log(o.age.toUpperCase())",
        '} catch (e) {',
        "    console.log('caught')",
        '}',
      ],
      answerLine: 2,
      hint: 'o.age 不存在。',
      explain: '第 3 行 o.age 是 undefined，调 .toUpperCase() 抛 TypeError。错误被 catch 接住后程序继续跑，打印 "caught"。这条题展示的是「未受保护时会崩，加 catch 后安全」——典型的错误处理教程题。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const f = (x) => x * 2\nconsole.log(f(5))",
      options: ['10', '"5"', '"10"', '报错'],
      answerIndex: 0,
      hint: '箭头函数一行写法。',
      explain: 'const f = (x) => x * 2 是箭头函数的简写。f(5) 直接算 5 * 2 = 10。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "const arr = [1, 2, 3]\nconst sum = arr.reduce((acc, x) => acc + x, 0)\nconsole.log(sum)",
      options: ['3', '6', '"123"', '报错'],
      answerIndex: 1,
      hint: 'reduce 把数组「折」成一个值。',
      explain: 'arr.reduce((累加器, 当前) => 累加器 + 当前, 起点) 是数组累加的标准写法：(((((0+1)+2)+3)) = 6。这是数组求和最函数式的写法。',
    },
    {
      kind: 'output',
      prompt: '执行后 output 是？',
      code: "function f() {\n    try {\n        return 'try'\n    } finally {\n        console.log('cleanup')\n    }\n}\nconsole.log(f())",
      options: ['"cleanup"', '"try"', '"try" "cleanup"', '"cleanup" "try"'],
      answerIndex: 3,
      hint: 'finally 在 return 之后跑。',
      explain: '先返回 "try"，但 finally 在 return 之前/之后？看实现：JS 规范是 finally 在 return 完成前跑（确保清理），但实际打印顺序是 "cleanup" 先，然后控制权回到调用方打印 "try"。这是 finally 的微妙之处：哪怕函数准备返回，清理逻辑也必须跑完。',
    },
  ],
}

const regionJ4: RegionDef = {
  id: 'j4',
  name: '对象、函数与异常',
  tagline: 'JS 入门通关',
  levels: [j4a, j4b, j4c, j4d, j4Boss],
}

export const javascriptBasics: CourseDef = {
  id: 'javascript-basics',
  title: 'JS 基础',
  subtitle: 'JavaScript 入门：从变量到对象与闭包',
  lang: 'JavaScript',
  // regionJ5Stub 为秘境岛占位（服务端下发制），不影响常规解锁链
  regions: [regionJ1, regionJ2, regionJ3, regionJ4, regionJ5Stub],
}