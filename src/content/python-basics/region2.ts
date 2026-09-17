import type { RegionDef } from '../course'

/**
 * 区域 2：分支森林（高效入门版）
 *
 * 每关 4-5 题 = 1 选择 + 1 输出 + 1 填空 + 1 改错 (+ 可选 应用)，
 * 螺旋复习 region1 的字符串与变量。
 */
export const region2: RegionDef = {
  id: '2',
  name: '分支森林',
  tagline: '每条岔路都是一次选择',
  levels: [
    // ============ 2-1 布尔值与比较 ============
    {
      id: '2-1',
      name: '真假分叉路',
      xp: 38,
      gold: 13,
      learn: {
        title: '布尔值与比较：岔路口的指示牌',
        body: [
          '布尔值只有两个：True（真）和 False（假）。注意首字母必须大写——true 和 false 在 Python 里不是布尔值，会报 NameError。',
          '比较运算符用来「比大小」，结果一定是布尔值：== 相等、!= 不等、> 大于、< 小于、>= 大于等于、<= 小于等于。',
          '最容易踩的坑：= 是赋值（把值放进变量），== 才是比较（问两边是否相等）。另外 "1" 是字符串、1 是整数，类型不同，"1" == 1 的结果是 False。',
        ],
        code: 'True            # → True\nFalse           # → False\n5 > 3           # → True\n5 == 5          # → True\n5 != 3          # → True\n"1" == 1        # → False（类型不同）',
      },
      questions: [
        {
          kind: 'choice',
          prompt: '下列哪个是 Python 里合法的布尔值？',
          options: ['true', 'True', 'TRUE', '都对'],
          answerIndex: 1,
          hint: '布尔值的首字母大写，其余小写。',
          explain: 'Python 的布尔值是 True 和 False，首字母大写、其余小写。true、TRUE 都不是合法写法，会触发 NameError。',
        },
        {
          kind: 'output',
          prompt: '执行后 result 是多少？',
          code: 'x = 5\nx == 5',
          options: ['True', 'False', '5', '报错'],
          answerIndex: 0,
          hint: '想想 = 和 == 分别是什么意思。',
          explain: 'x = 5 是赋值，把 5 放进 x；x == 5 是比较，问 x 是否等于 5。此时 x 就是 5，所以结果为 True。记住：单个 = 是赋值，两个 = 才是比较。',
        },
        {
          kind: 'fill',
          prompt: '补全比较运算符，判断分数是否及格（60 分及以上算及格）：',
          code: 'score = 75\npassed = score ___ 60   # → True',
          answers: ['>='],
          placeholder: '两个字符的比较运算符',
          hint: '「大于」用 >，「等于」用 =，合起来就是…',
          explain: '>= 表示「大于等于」。score = 75，75 >= 60 为 True。如果只用 > 就漏掉了恰好 60 分的情况。',
        },
        {
          kind: 'bug',
          prompt: '下面三行里，哪一行会报错？',
          code: ['age = 18', 'if age = 18:', '    print("成年")'],
          answerLine: 1,
          hint: '条件里该用比较，还是赋值？',
          explain: '第 2 行在 if 条件里用了单个 =（赋值），Python 不允许在 if 条件里赋值，会触发 SyntaxError。条件应该用 == 比较：if age == 18:。这是新手最经典的错误之一。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: '"1" == 1',
          options: ['True', 'False', '报错', '1'],
          answerIndex: 1,
          hint: '引号内外的世界并不相通。',
          explain: '"1" 是字符串，1 是整数，类型不同。== 会先判断类型，类型不同直接返回 False，不会报错也不会自动转换。',
        },
      ],
    },

    // ============ 2-2 if / elif / else ============
    {
      id: '2-2',
      name: '三岔口',
      xp: 40,
      gold: 14,
      learn: {
        title: 'if / elif / else：岔路口的路标',
        body: [
          'if 让程序「看条件决定走哪条路」：if 条件: 下面缩进的就是条件成立时执行的代码。冒号 : 和下一行的缩进（4 个空格）是语法的一部分，少一个都不行。',
          'elif 是「否则如果」——当前面的 if 没中，就来试 elif 的条件。else 是「其余情况」，前面都没中就兜底。一条 if-elif-else 链只会命中第一个成立的分支，命中后就跳出，后面的条件不再检查。',
          '终于要正式介绍 print() 了：把括号里的内容打印到屏幕上。print("你好") 会在屏幕上显示「你好」。有了它，分支的结果终于能看见了。',
        ],
        code: 'score = 75\nif score >= 90:\n    print("优秀")\nelif score >= 60:\n    print("及格")\nelse:\n    print("加油")\n# → 输出「及格」（命中第一个成立的分支后跳出）',
      },
      questions: [
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'gold = 99\nif gold >= 100:\n    print("富裕")\nelse:\n    print("还差一点")',
          options: ['富裕', '还差一点', '什么都不输出', '报错'],
          answerIndex: 1,
          hint: '99 满足 gold >= 100 吗？',
          explain: 'gold = 99，条件 gold >= 100 不成立（99 < 100），走 else 分支，输出「还差一点」。if 不成立才会检查 elif，elif 也不成立才走 else。',
        },
        {
          kind: 'bug',
          prompt: '下面哪一行会报错？',
          code: ['if age >= 18', '    print("成年")'],
          answerLine: 0,
          hint: 'if 条件写完后还差什么标点？',
          explain: '第 1 行：if 语句的条件后必须有冒号 :，漏掉会触发 SyntaxError。正确写法是 if age >= 18:。少了冒号连第 2 行的 print 都没机会执行。',
        },
        {
          kind: 'fill',
          prompt: '补全关键字，让分数 50 分时输出「加油」：',
          code: 'score = 50\nif score >= 60:\n    print("及格")\n___:\n    print("加油")',
          answers: ['else'],
          placeholder: '四个字母的关键字',
          hint: '前面条件不成立时的兜底分支。',
          explain: 'else 是「其余所有情况」的兜底分支，不需要写条件。score = 50 不满足 >= 60，走 else 输出「加油」。',
        },
        {
          kind: 'order',
          prompt: '把这几行排成一条完整的 if-else 结构（缩进已标好）：',
          lines: ['if hp > 0:', '    print("还活着")', 'else:', '    print("倒下了")'],
          hint: '先有 if 条件，再写 if 里的代码，最后才是 else 及其代码。',
          explain: 'if 语句的结构：先写 if 和条件及冒号，然后缩进写条件成立时执行的代码，最后是 else: 及其缩进代码。顺序不能乱。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'x = 7\nif x > 10:\n    print("大")\nelif x > 5:\n    print("中")\nelif x > 0:\n    print("小")',
          options: ['大', '中', '小', '中和小'],
          answerIndex: 1,
          hint: 'elif 链只会命中第一个成立的分支。',
          explain: 'x = 7：第一个条件 x > 10 不成立；第二个条件 x > 5 成立，输出「中」并跳出整条链。第三个 x > 0 虽然也成立，但 elif 命中第一个后就不再检查了。',
        },
      ],
    },

    // ============ 2-3 and / or / not ============
    {
      id: '2-3',
      name: '咒语组合',
      xp: 42,
      gold: 15,
      learn: {
        title: 'and / or / not：组合你的条件咒语',
        body: [
          'and（与）像两把钥匙开同一把锁：两边都为 True 才是 True，任何一边是 False 就失败。or（或）像双开门：任何一边为 True 就通过，两边都 False 才失败。',
          'not（非）是把结果翻转：not True 得 False，not False 得 True。常用来表达「如果不满足某条件」。',
          '组合使用时，not 的优先级最高，and 其次，or 最低。拿不准就加括号，括号永远最优先。',
        ],
        code: 'hp = 80\nmp = 30\nhp > 0 and mp > 0        # → True（两边都成立）\nhp > 0 or mp > 100       # → True（只要一边成立）\nnot (hp > 100)           # → True（hp > 100 为 False，翻转得 True）\nhp > 50 and not mp < 10  # → True（先算 not，再算 and）',
      },
      questions: [
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'True and False',
          options: ['True', 'False', '报错', 'None'],
          answerIndex: 1,
          hint: 'and 要求两边都为真。',
          explain: 'and 是「并且」：两边都是 True 才返回 True。这里 False 拖了后腿，结果是 False。',
        },
        {
          kind: 'fill',
          prompt: '补全逻辑运算符，让「血量大于 0 且蓝量大于 0」同时成立才为真：',
          code: 'hp = 80\nmp = 20\nalive = hp > 0 ___ mp > 0   # → True',
          answers: ['and'],
          placeholder: '三个字母的逻辑运算符',
          hint: '「两边都成立」用哪个词？',
          explain: 'and 表示「并且」，两边都为 True 才是 True。hp > 0 为 True、mp > 0 也为 True，所以 alive 为 True。',
        },
        {
          kind: 'bug',
          prompt: '下面三行里，哪一行会导致报错？',
          code: ['score = 85', 'if score > 60 and < 90:', '    print("中等")'],
          answerLine: 1,
          hint: '每个比较运算符两边都要有操作数。',
          explain: '第 2 行 < 90 左边缺了操作数，Python 不会自动补上 score。正确写法是 if score > 60 and score < 90:，或用链式比较 60 < score < 90。',
        },
        {
          kind: 'choice',
          prompt: 'not True or True 的结果是？',
          options: ['True', 'False', '报错', 'None'],
          answerIndex: 0,
          hint: 'not 先算，or 后算。',
          explain: '优先级：not 最高，or 最低。先算 not True = False，再算 False or True = True。拿不准就加括号：(not True) or True，一目了然。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'a = 10\nb = 20\na > b or a < b',
          options: ['True', 'False', '报错', '10'],
          answerIndex: 0,
          hint: '把两个比较分别算出来，再看 or。',
          explain: 'a > b 为 False（10 不大于 20），a < b 为 True。False or True = True。or 只要一边成立就为 True。',
        },
      ],
    },

    // ============ 2-B Boss: 分支森林全线综合 ============
    {
      id: '2-B',
      name: '分支森林大测验',
      xp: 110,
      gold: 45,
      boss: true,
      learn: {
        title: 'Boss：分支森林全线复习',
        body: [
          '这一关没有新知识。6 道题覆盖布尔值、比较运算符、if/elif/else 和逻辑运算——答错会当场给解析，放心冲。',
          '全对零提示才能拿到 ★★★ 和完整战利品。森林的岔路已全部铺好，出发！',
        ],
      },
      questions: [
        {
          kind: 'output',
          prompt: '7 != 7 的结果是？',
          code: '7 != 7',
          options: ['True', 'False', '7', '报错'],
          answerIndex: 1,
          hint: '!= 问的是「不相等」。',
          explain: '!= 是「不等于」。7 当然等于 7，所以「7 不等于 7」为 False。',
        },
        {
          kind: 'bug',
          prompt: '下面三行里，哪一行会导致报错？',
          code: ['hp = 100', 'if hp > 0 AND hp < 200:', '    print("正常")'],
          answerLine: 1,
          hint: 'Python 的逻辑运算符是小写的三个单词。',
          explain: '第 2 行用了大写 AND，Python 不认识大写 AND（只有小写 and 才是逻辑运算符），会触发语法错误。正确写法：if hp > 0 and hp < 200:。',
        },
        {
          kind: 'fill',
          prompt: '补全关键字，让这段代码在血量为 0 时输出「倒下」：',
          code: 'hp = 0\n___ hp <= 0:\n    print("倒下")',
          answers: ['if'],
          placeholder: '两个字母的关键字',
          hint: '最基础的条件判断语句。',
          explain: 'if 是最基本的条件判断关键字。hp = 0，条件 hp <= 0 成立，输出「倒下」。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'level = 3\nif level >= 5:\n    print("高手")\nelif level >= 1:\n    print("新手")\nelse:\n    print("未入门")',
          options: ['高手', '新手', '未入门', '什么都不输出'],
          answerIndex: 1,
          hint: '从上往下，找到第一个成立的分支就停。',
          explain: 'level = 3：第一个条件 level >= 5 不成立；第二个 level >= 1 成立，输出「新手」并跳出。else 不再执行。',
        },
        {
          kind: 'choice',
          prompt: '下列说法正确的是？',
          options: ['if 语句可以没有 elif 和 else', 'elif 和 else 可以单独使用', 'if 后面不需要冒号', 'else 后面必须跟条件'],
          answerIndex: 0,
          hint: '想想最简单的条件判断需要什么。',
          explain: 'if 可以单独使用，不需要 elif 和 else。但 elif 和 else 不能单独出现，必须跟在 if 后面。if 和 else 末尾都要冒号；else 不需要写条件。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'False or False or True',
          options: ['True', 'False', '报错', 'None'],
          answerIndex: 0,
          hint: 'or 链从左往右算，只要有一个 True…',
          explain: 'or 是「或者」：只要有一个 True 就为 True。前两个 False 不影响，第三个 True 让整个表达式为 True。森林已踏平，胜利就在前方！',
        },
      ],
    },
  ],
}