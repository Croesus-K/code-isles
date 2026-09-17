import type { CourseDef } from '../course'
import type { LevelDef, RegionDef } from '../course'

/**
 * 第二门课程：JavaScript 基础。
 * 区域 id 使用 j 前缀（j1/j2...），与 Python 课程的 '1'..'5' 在同一份存档中共存互不冲突。
 * 错题本 questionKey = "${regionId}:${levelId}:${qIndex}"，regionId 全局唯一是硬前提。
 */

const j1a: LevelDef = {
  id: 'j1-1',
  name: 'let 与 const',
  xp: 30,
  gold: 12,
  learn: {
    title: '变量码头：let、const 与类型',
    body: [
      'JavaScript 用 let 声明可以重新赋值的变量，用 const 声明一旦赋值就不能再改的常量。不写声明符直接赋值（x = 1）会创建全局变量，是新手大坑，别这么写。',
      'JS 的变量没有固定类型：数字、字符串、布尔值都可以放进同一个变量里，赋什么就是什么。这叫动态类型。',
      '字符串相加用 +，数字和字符串相加时数字会被"拼"进去而不是相加—— \'HP:\' + 70 得到 "HP:70"。',
    ],
    code: "let hp = 100        // 会变的值用 let\nconst name = '像素侠' // 不变的用 const\nhp = hp - 30\nconsole.log(name + ' 剩余 HP：' + hp) // 像素侠 剩余 HP：70",
  },
  questions: [
    {
      kind: 'choice',
      prompt: '下面哪种声明创建的变量，之后不能重新赋值？',
      explain: 'const 声明的是常量：只能赋值一次，再赋值会抛 TypeError。let 声明的变量可以随意重新赋值。',
      options: ['let x = 1', 'const x = 1', 'var x = 1', 'x = 1'],
      answerIndex: 1,
      hint: '名字里就带着答案——"常量"的常。',
    },
    {
      kind: 'output',
      prompt: '运行这段代码会输出什么？',
      code: "let a = 5\na = a + 2\nconsole.log(a)",
      explain: 'a 先被赋值 5，再重新赋值为 5 + 2 = 7。let 允许重新赋值，console.log 打印 7。',
      options: ['输出 5', '输出 7', '输出 52', '报错'],
      answerIndex: 1,
      hint: 'a + 2 是数字相加，不是字符串拼接。',
    },
    {
      kind: 'fill',
      prompt: '补全声明关键字，让这段代码能正常运行（greeting 之后被重新赋值了）：',
      code: "___ greeting = '你好'\ngreeting = greeting + '，世界！'\nconsole.log(greeting)",
      answers: ['let', 'var'],
      placeholder: 'let 或 var',
      explain: 'greeting 之后被重新赋值，不能用 const（会抛 TypeError）。用 let（推荐）或 var。',
      hint: 'const 行不通，还能用谁？',
    },
    {
      kind: 'order',
      prompt: '把打乱的代码行拖回正确顺序，让程序输出「剩余 HP：70」：',
      lines: ['let hp = 100', 'hp = hp - 30', "console.log('剩余 HP：' + hp)"],
      explain: 'JS 自上而下逐行执行：先声明 hp，再扣血，最后打印。顺序错了就会用到未定义的变量。',
      hint: '必须先有 hp，才能改 hp、打印 hp。',
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
    title: 'Boss 挑战前学习：模板字符串',
    body: [
      '拼接长字符串时用 + 很容易晕。模板字符串用反引号 ` 包裹，变量直接写进 ${} 里，所见即所得。',
      '${} 里可以放任何表达式：变量、算式、函数调用都行。反引号里的换行和空格也会原样保留。',
      '常用字符串方法：.toUpperCase() 转大写、.length 取长度。它们都"返回新值"，不改变原字符串。',
    ],
    code: "const name = '像素侠'\nconst hp = 70\nconsole.log(`冒险者 ${name}（HP ${hp}/100）`)\n// 冒险者 像素侠（HP 70/100）",
  },
  questions: [
    {
      kind: 'choice',
      prompt: '哪种写法是正确的模板字符串？',
      explain: '模板字符串必须用反引号 ` 包裹（键盘 Esc 下方那个键），插入变量用 ${}。单引号双引号里的 ${} 只是普通字符。',
      options: ['"你好, ${name}"', '`你好, ${name}`', "'你好, ${name}'", '`你好, {name}`'],
      answerIndex: 1,
      hint: '找反引号，并且 ${} 一个都不能少。',
    },
    {
      kind: 'output',
      prompt: '运行这段代码会输出什么？',
      code: "const name = '像素侠'\nconsole.log(`你好, ${name}!`)",
      explain: '反引号 + ${name}：变量被替换进字符串，输出「你好, 像素侠!」。',
      options: ['你好, ${name}!', '你好, 像素侠!', '你好, name!', '报错'],
      answerIndex: 1,
      hint: '${} 里是要替换的表达式。',
    },
    {
      kind: 'fill',
      prompt: '补全模板字符串里的变量，让公告牌显示正确的金币数：',
      code: 'const price = 8\nconst msg = `总共 ${___} 金币`',
      answers: ['price'],
      placeholder: 'price',
      explain: '${} 里写变量名 price，模板字符串会把它替换成 8。',
      hint: '要把哪个变量放进去？',
    },
    {
      kind: 'bug',
      prompt: '下面哪一行会报错？',
      code: ["const name = '岛民'", "name = '新岛民'", 'console.log(`你好, ${name}`)'],
      answerLine: 1,
      explain: 'name 是 const 声明的常量，第 2 行重新赋值会抛 TypeError: Assignment to constant variable。之后还要改的值请用 let。',
      hint: '谁不允许重新赋值来着？',
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
  subtitle: 'JavaScript 入门：变量、类型与模板字符串',
  lang: 'JavaScript',
  regions: [regionJ1, regionJ2],
}