import type { CourseDef } from '../course'
import type { LevelDef, RegionDef } from '../course'

/**
 * 第二门课程：JavaScript 基础（高效入门版）。
 *
 * 设计目标：让新手最快最高效地掌握 JavaScript 入门两件套——
 * let/const 变量声明、模板字符串。
 *
 * 节奏：每关 3-4 道题 = 1 选择（确认理解）+ 1 Bug/输出（实战）+ 1 应用（拼装公告牌）。
 * 区域 id 使用 j 前缀（j1/j2...），与 Python 课程的 '1'..'5' 在同一份存档中共存互不冲突。
 * 错题本 questionKey = "${regionId}:${levelId}:${qIndex}"，regionId 全局唯一是硬前提。
 */

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
      code: "let a = 5\na = a + 2\nconsole.log(a)",
      options: ['输出 5', '输出 7', '输出 52', '报错'],
      answerIndex: 1,
      hint: 'a + 2 是数字相加，不是字符串拼接。',
      explain: 'a 先被赋值 5，再重新赋值为 5 + 2 = 7。let 允许重新赋值，console.log 打印 7。变量"更新"模式在 JS 和 Python 里完全一样。',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会报错？',
      code: [
        "const name = '像素侠'",
        "name = '新像素侠'",
        "console.log(name)",
      ],
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
  id: 'j1-B',
  name: '模板字符串',
  xp: 50,
  gold: 20,
  boss: true,
  learn: {
    title: 'Boss：模板字符串与字符串方法',
    body: [
      '拼接长字符串用 + 容易晕。模板字符串用反引号 ` 包裹，变量直接写进 ${} 里，所见即所得。',
      '${} 里能放任何表达式：变量、算式、函数调用都行。反引号里的换行和空格也会原样保留。',
      '常用方法：.toUpperCase() 转大写、.length 取长度、.trim() 去两端空格。它们都"返回新值"，不改变原字符串（字符串不可变）。',
    ],
    code: "const name = '像素侠'\nconst gold = 99\nconst msg = `冒险者 ${name} 金币: ${gold}`\nmsg.toUpperCase()   // → 「冒险者 像素侠 金币: 99」",
  },
  questions: [
    {
      kind: 'choice',
      prompt: '哪种写法是正确的模板字符串？',
      options: [
        '"你好, ${name}"',
        '`你好, ${name}`',
        "'你好, ${name}'",
        '`你好, {name}`',
      ],
      answerIndex: 1,
      hint: '找反引号，并且 ${} 一个都不能少。',
      explain: '模板字符串必须用反引号 ` 包裹（键盘 Esc 下方那个键），插入变量用 ${}。单引号双引号里的 ${} 只是普通字符，不会替换。漏写 $ 也只是普通文本。',
    },
    {
      kind: 'output',
      prompt: '运行这段代码会输出什么？',
      code: "const name = '像素侠'\nconsole.log(`你好, ${name}!`)",
      options: [
        '你好, ${name}!',
        '你好, 像素侠!',
        '你好, name!',
        '报错',
      ],
      answerIndex: 1,
      hint: '${} 里是要替换的表达式。',
      explain: '反引号 + ${name}：变量被替换进字符串，输出「你好, 像素侠!」。这是模板字符串最基础的用法。',
    },
    {
      kind: 'output',
      prompt: '执行后输出什么？',
      code: "const name = 'pixel'\nconsole.log(name.toUpperCase())",
      options: [
        'pixel',
        'PIXEL',
        '报错',
        'undefined',
      ],
      answerIndex: 1,
      hint: '字符串方法都"返回新值"，不影响原字符串。',
      explain: '.toUpperCase() 返回大写形式的新字符串 "PIXEL"，原字符串 name 没变（字符串在 JS 里是不可变的）。这种"返回新值"的特性在 .trim()、.slice() 等方法上也一样。',
    },
    {
      kind: 'fill',
      prompt: '补全模板字符串里的表达式，让公告牌显示双倍金币数：',
      code: 'const gold = 99\nconst msg = `双倍金币: ${___ * 2}`',
      answers: ['gold'],
      placeholder: 'gold',
      hint: '要把哪个变量乘以 2 嵌进去？',
      explain: '${gold * 2} 里放表达式，gold * 2 = 198。模板字符串的 ${} 不仅是变量名，任何 JS 表达式都支持 —— 算式、函数调用、三元运算符都行。这是它比字符串拼接 + 灵活的关键。',
    },
  ],
}

const regionJ1: RegionDef = {
  id: 'j1',
  name: '变量码头',
  tagline: '从 let / const 开始的 JS 之旅',
  levels: [j1a, j1b],
}

const regionJ2: RegionDef = {
  id: 'j2',
  name: '函数灯塔',
  tagline: '用函数把重复的代码收进匣子（建设中）',
  comingSoon: true,
  levels: [],
}

export const javascriptBasics: CourseDef = {
  id: 'javascript-basics',
  title: 'JS 基础',
  subtitle: 'JavaScript 入门：变量声明与模板字符串',
  lang: 'JavaScript',
  regions: [regionJ1, regionJ2],
}