import type { RegionDef } from '../course'

/**
 * 隐藏区域：秘境岛（JS）。打赏后凭专属密钥解锁（见 core/secret-key.ts）。
 * 不在常规解锁链上：isRegionUnlocked 对 hidden 区域只看密钥，不看前置 Boss。
 *
 * 内容定位：毕业加试。8 道题全部来自课程教过的知识点，专挑最容易
 * 踩坑的角落（NaN、var 泄漏、sort 字典序、const 冻结绑定……）。
 * 每道题的输出都经过 node 实测验证，不是"看起来对"。
 */
export const regionJ5: RegionDef = {
  id: 'j5',
  name: '秘境岛',
  tagline: '藏宝图上的最后一座岛',
  hidden: true,
  levels: [
    {
      id: 'j5-1',
      name: '毕业加试：老坑新游',
      xp: 200,
      gold: 80,
      boss: true,
      learn: {
        title: '秘境岛：把学过的坑再踩一遍（这次是故意的）',
        body: [
          '这座岛没有新知识——8 道题全部出自前 4 个区域教过的内容，但每一道都是真实项目里高频翻车的角落。',
          'JS 是一门"看起来随便写也能跑"的语言，正因为如此，坑都藏在运行时。读题时多想一层：这个表达式到底怎么求值？这个方法到底改不改原数组？',
          '全对拿到 ★★★ 的冒险者，才算真正从新手村毕业。',
        ],
        code: '// 秘境岛的题目没有统一套路，只有一条心法：\n// 不要猜"JS 会帮我转类型"，要问"规范就是这么写的"。\n// 每一道题的正确答案，都可以用 node 实测复现。',
      },
      questions: [
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: "const a = 5\nconsole.log(`value: ${a * 2}`)",
          options: ['value: 10', 'value: ${a * 2}', 'value: a * 2', '报错'],
          answerIndex: 0,
          hint: '模板字符串的 ${} 里可以放任意表达式。',
          explain: '模板字符串的 ${} 里放的是表达式，求值后把结果嵌进字符串：a * 2 = 10，得 "value: 10"。这比字符串拼接 "value: " + a * 2 更可读，是 JS 写动态文本的标准方式。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'console.log(NaN === NaN)',
          options: ['true', 'false', '报错', 'NaN'],
          answerIndex: 1,
          hint: 'NaN 有个独一无二的脾气。',
          explain: 'NaN 是全 JS 唯一"不等于自己"的值：NaN === NaN 是 false。所以不能用 === 判断一个值是不是 NaN，要用 Number.isNaN(x)。这是 IEEE-754 浮点规范的规定，不是 JS 的 bug——但只有 JS 让它天天撞到你面前。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'for (var i = 0; i < 3; i++) {}\nconsole.log(i)',
          options: ['2', '3', 'undefined', '报错'],
          answerIndex: 1,
          hint: 'var 是函数作用域，出了循环还活着。',
          explain: 'var 声明的变量是函数作用域：循环结束后 i 依然存在，值为让条件第一次失败的 3。换成 let 的话，i 是块作用域，循环外访问直接 ReferenceError。这就是"永远用 let/const"最有力的理由之一。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'console.log([1, 2, 10, 20].sort())',
          options: ['[1, 2, 10, 20]', '[1, 10, 2, 20]', '[1, 2, 20, 10]', '报错'],
          answerIndex: 1,
          hint: 'sort 默认按什么顺序排？',
          explain: 'sort() 不传比较函数时，把元素转成字符串按字典序排："10" < "2"（逐字符比，"1" < "2"），所以 [1, 10, 2, 20]。数字排序必须写 sort((a, b) => a - b)。这是 JS 数组最著名的坑之一。',
        },
        {
          kind: 'bug',
          prompt: '下面哪一行会报错？（注意 arr.push 是成功的）',
          code: ['const arr = [1, 2]', 'arr.push(3)', 'arr = []'],
          answerLine: 2,
          hint: 'const 冻结的到底是什么？',
          explain: '第 3 行：const 冻结的是"变量与值的绑定"，不是值本身——arr.push(3) 修改数组内容完全合法，但 arr = [] 想让 arr 指向新数组，就动了绑定，抛 TypeError: Assignment to constant variable。想整个数组都不可变要用 Object.freeze（浅冻结）。',
        },
        {
          kind: 'fill',
          prompt: '补全函数名，把字符串 "42" 转成数字 42：',
          code: 'const n = ___("42")\nconsole.log(n + 1)   // → 43',
          answers: ['Number'],
          placeholder: '六个字母',
          hint: '是全局的转换函数，也是类型名。',
          explain: 'Number("42") 把字符串转成数字 42，n + 1 得 43（数字加法）。不用转换的话 "42" + 1 是字符串拼接 "421"——+ 号遇上字符串永远优先拼接。表单输入拿到的都是字符串，先 Number() 再做算术是标准姿势。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: "console.log(1 + 2 + '3')",
          options: ['"33"', '"123"', '6', '报错'],
          answerIndex: 0,
          hint: '+ 号从左到右依次求值。',
          explain: '加法从左到右：先算 1 + 2 = 3（数字加法），再算 3 + "3" —— 数字遇上字符串变成拼接，得 "33"。注意 "3" + 1 + 2 就反过来得 "312"：第一个操作数决定走加法还是拼接。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: "console.log(0 ?? 'default')",
          options: ['0', "'default'", 'true', '报错'],
          answerIndex: 0,
          hint: '?? 只认 null 和 undefined，其他值都算"有值"。',
          explain: '?? 是空值合并：只有左侧是 null 或 undefined 才取右侧。0 是合法值，直接返回 0。换成 || 的话 0 是 falsy，会返回 "default"——所以"给默认值"时 ?? 和 || 的区别在 0、""、false 上都会现形。需要区分"没填"和"填了 0"就用 ??。',
        },
      ],
    },
  ],
}
