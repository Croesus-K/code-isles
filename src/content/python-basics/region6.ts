import type { RegionDef } from '../course'

/**
 * 隐藏区域：秘境岛（Python）。打赏后凭专属密钥解锁（见 core/secret-key.ts）。
 * 不在常规解锁链上：isRegionUnlocked 对 hidden 区域只看密钥，不看前置 Boss。
 *
 * 内容定位：毕业加试。8 道题全部来自课程教过的知识点，但专挑最容易
 * 踩坑的角落（可变默认参数、列表别名、元组不可变、负步长切片……）。
 * 每道题的输出都经过 python 3 实测验证，不是"看起来对"。
 */
export const region6: RegionDef = {
  id: '6',
  name: '秘境岛',
  tagline: '藏宝图上的最后一座岛',
  hidden: true,
  levels: [
    {
      id: '6-1',
      name: '毕业加试：老坑新游',
      xp: 200,
      gold: 80,
      boss: true,
      learn: {
        title: '秘境岛：把学过的坑再踩一遍（这次是故意的）',
        body: [
          '这座岛没有新知识——8 道题全部出自前 5 个区域教过的内容，但每一道都是真实项目里高频翻车的角落。',
          '在这里，"运行结果和直觉不一样"不是题目出错了，而恰恰是考点本身。读题时多想一层：这个类型的值到底会不会被改？这行代码到底返回了什么？',
          '全对拿到 ★★★ 的冒险者，才算真正从新手村毕业。',
        ],
        code: '# 秘境岛的题目没有统一套路，只有一条心法：\n# 不要猜"Python 会帮我修正"，要问"规范就是这么写的"。\n# 每一道题的正确答案，都可以用 python 实测复现。',
      },
      questions: [
        {
          kind: 'choice',
          prompt: 'a = [1, 2]、b = [1, 2]、c = a。下面哪些判断的结果是 True？',
          options: ['a == b 且 a is c', 'a is b 且 a == c', 'a == b 且 a is b', 'a is b 且 a is c'],
          answerIndex: 0,
          hint: '== 比较值，is 比较身份（是不是同一个对象）。',
          explain: 'a == b：值相等 → True。c = a 让 c 和 a 指向同一个列表 → a is c 是 True。但 a 和 b 是两个独立创建的列表，就算内容一样，a is b 也是 False。这就是 is 和 == 的根本区别：一个比身份，一个比值。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))',
          options: ['3', '4', '报错', '看情况'],
          answerIndex: 1,
          hint: 'b = a 复制了列表吗？',
          explain: 'b = a 不复制列表，只是让两个名字指向同一个列表。b.append(4) 改的就是 a 也能看到的那个列表，所以 len(a) 是 4。想真正复制要用 a.copy() 或 list(a)。这是 Python 高频坑第一名。',
        },
        {
          kind: 'output',
          prompt: '执行后输出的两行分别是？',
          code: 'def collect(x, bag=[]):\n    bag.append(x)\n    return bag\n\nprint(collect(1))\nprint(collect(2))',
          options: ['[1] 和 [2]', '[1] 和 [1, 2]', '[1] 和 [1]', '报错'],
          answerIndex: 1,
          hint: '默认参数 bag=[] 在什么时候创建？',
          explain: '默认参数 bag=[] 只在 def 语句执行时创建一次，之后所有调用共享同一个列表。第一次调用得 [1]，第二次往同一个列表里追加 2，得 [1, 2]。可变对象做默认参数是著名的坑——正确写法是 bag=None 然后在函数体里 bag = []。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 's = "isle"\ns.upper()\nprint(s)',
          options: ['ISLE', 'isle', 'Isle', '报错'],
          answerIndex: 1,
          hint: '字符串方法会修改原字符串吗？',
          explain: '字符串不可变：s.upper() 返回一个全新的大写字符串，原字符串 s 一个字符都不会变——而这里没有把返回值接住，直接丢掉了。想拿到大写结果要写 s = s.upper()。列表的 .append() 是原地修改，字符串方法全是返回新值，两类行为要分清。',
        },
        {
          kind: 'fill',
          prompt: '补全方法名，安全地取「宝石」：键不存在时返回 0 而不是报错：',
          code: 'chest = {"金币": 10}\ngem = chest.___("宝石", 0)\nprint(gem)   # → 0',
          answers: ['get'],
          placeholder: '三个字母',
          hint: '字典的安全取值方法，第二个参数是缺省值。',
          explain: 'chest.get("宝石", 0)：键存在返回对应值，不存在返回第二个参数 0，绝不抛 KeyError。 chest["宝石"] 这种方括号写法在键不存在时会当场报错。秘境岛之外，这是写配置读取的标准姿势。',
        },
        {
          kind: 'bug',
          prompt: '下面哪一行会报错？',
          code: ['t = (1, 2, 3)', 't[0] = 9', 'print(t)'],
          answerLine: 1,
          hint: '圆括号装的这一家子，有个雷打不动的规矩。',
          explain: '第 2 行：元组不可变，t[0] = 9 抛 TypeError: \'tuple\' object does not support item assignment。元组适合装"定死不变"的一组值（坐标、日期的年月日）；需要修改就用列表。这是两种容器最核心的分界线。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 's = "abcde"\nprint(s[::-1])',
          options: ['abcde', 'edcba', 'a', '报错'],
          answerIndex: 1,
          hint: '步长为 -1 的切片会怎么走？',
          explain: 's[::-1] 表示"整串、步长 -1"：从尾到头倒着切，得到反转字符串 "edcba"。切片三段式 [start:stop:step] 里 start/stop 省略就是"取到头"，负步长把方向反过来。这是 Python 反转字符串/列表最简洁的惯用写法。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？（中文同样能切）',
          code: 'name = "代码群岛"\nprint(name[1:3])',
          options: ['码群', '代码', '群岛', '报错'],
          answerIndex: 0,
          hint: '含头不含尾，从索引 1 切到索引 3 之前。',
          explain: '中文字符串一样按索引切片：name[1:3] 从索引 1（码）取到索引 3 之前（不含群），得 "码群"。含头不含尾的规则对任何字符串都成立，中文、emoji 也不例外——切片按字符数，不是按字节。',
        },
      ],
    },
  ],
}
