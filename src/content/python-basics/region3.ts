import type { RegionDef } from '../course'

/**
 * 区域 3：循环洞窟（高效入门版）
 *
 * 每关 4-5 题 = 1 选择 + 1 输出 + 1 填空 + 1 改错 (+ 可选 应用)，
 * 螺旋复习 region1-2 的变量、字符串、布尔值。
 */
export const region3: RegionDef = {
  id: '3',
  name: '循环洞窟',
  tagline: '重复的活儿交给咒语',
  levels: [
    // ============ 3-1 for 循环 + range ============
    {
      id: '3-1',
      name: '复读机阵',
      xp: 42,
      gold: 15,
      learn: {
        title: 'for 循环：让咒语自己重复',
        body: [
          'for 循环是"照着清单念咒语"：for i in range(3) 会让变量 i 依次取 0、1、2，把缩进在循环体里的语句跑三遍。',
          'range 是生成数字序列的函数：range(3) 从 0 数到 2（不含 3）；range(1, 4) 从 1 数到 3（含头不含尾）；range(起, 止, 步长) 还能指定步长。',
          '缩进决定谁在循环里：紧跟 for 且缩进的语句是循环体，每轮都跑；和 for 对齐不缩进的语句在循环结束后只执行一次。',
        ],
        code: 'for i in range(3):\n    print(i)          # 依次输出 0、1、2\n\nfor i in range(1, 4):\n    print(i)          # 依次输出 1、2、3（含头不含尾）\n\nfor i in range(0, 10, 2):\n    print(i)          # 依次输出 0、2、4、6、8（步长为 2）',
      },
      questions: [
        {
          kind: 'choice',
          prompt: 'range(3) 生成的数字序列是？',
          options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '1, 2'],
          answerIndex: 0,
          hint: 'range 从 0 开始数，且不包含终点。',
          explain: 'range(3) 从 0 开始，生成 0、1、2 三个数——不包含参数 3。它不是"从 1 数到 3"，而是"给我 3 个数，从 0 起"。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'for i in range(3):\n    print(i)',
          options: ['0\n1\n2', '1\n2\n3', '0\n1\n2\n3', 'i\ni\ni'],
          answerIndex: 0,
          hint: '循环变量 i 每轮从 range 里取一个值，print 会把它输出。',
          explain: 'range(3) 产生 0、1、2，循环变量 i 依次取这三个值，print 三次分别输出 0、1、2，各占一行。',
        },
        {
          kind: 'fill',
          prompt: '补全代码，让循环打印 1 到 5（填一个函数名）：',
          code: 'for i in ___(1, 6):\n    print(i)',
          answers: ['range'],
          placeholder: '五个字母的内建函数名',
          hint: '它和 for 循环搭档，用来生成一串整数。',
          explain: 'range(1, 6) 生成 1 到 5（含头不含尾），配合 for 循环依次取出。range 是 for 循环最常用的"数字生成器"。',
        },
        {
          kind: 'bug',
          prompt: '下面两行里，哪一行会报错？',
          code: ['for i in range(3.5):', '    print(i)'],
          answerLine: 0,
          hint: 'range 的参数能是小数吗？',
          explain: 'range 的参数必须是整数，传入 3.5（float）会抛 TypeError: "float" object cannot be interpreted as an integer。需要整数迭代时先 int(...) 转一下。',
        },
        {
          kind: 'output',
          prompt: '执行后 total 是多少？',
          code: 'total = 0\nfor i in range(1, 4):\n    total = total + i\ntotal',
          options: ['6', '10', '7', '3'],
          answerIndex: 0,
          hint: 'range(1, 4) 生成 1、2、3（含头不含尾），累加到 total 里。',
          explain: 'range(1, 4) 生成 1、2、3 三轮循环。每次把 total 加上当前的 i：0+1=1，1+2=3，3+3=6。这是最经典的"累加器"模式——后面会反复用到。',
        },
      ],
    },

    // ============ 3-2 while 循环 ============
    {
      id: '3-2',
      name: '无底回廊',
      xp: 45,
      gold: 16,
      learn: {
        title: 'while 循环：只要条件成立就继续',
        body: [
          'while 循环是"只要条件还成立就继续跑"：while count < 3: 只要 count 小于 3，循环体就一直执行。',
          '和 for 不同，while 没有预设的次数——一切都看条件。所以循环体里必须有人更新条件涉及的变量（比如 count += 1），否则条件永远为 True，循环永远停不下来，这叫"死循环"。',
          '万一不小心写出死循环，在终端按 Ctrl + C 可以强行中断程序。while 最常见的用法之一是"计数器模式"：设一个计数器，每轮加 1，到上限就停。',
        ],
        code: 'count = 0\nwhile count < 3:\n    print(count)     # 依次输出 0、1、2\n    count += 1      # 忘了这行就变成死循环！',
      },
      questions: [
        {
          kind: 'choice',
          prompt: 'while 循环在什么情况下会结束？',
          options: ['条件为 True 时结束', '条件为 False 时结束', '执行固定次数后结束', '遇到 print 就结束'],
          answerIndex: 1,
          hint: 'while 后面跟一个条件，条件不满足了循环才会停。',
          explain: 'while 在每轮开始前检查条件：条件为 True 就继续跑循环体，为 False 就退出循环。和 for 不同，while 没有内置的"跑几次"——一切看条件。',
        },
        {
          kind: 'bug',
          prompt: '下面四行里，哪一行会报错？',
          code: ['n = 0', 'while n < 3', '    print(n)', '    n += 1'],
          answerLine: 1,
          hint: '循环语句的末尾少了什么符号？',
          explain: '第 2 行 while n < 3 末尾少了冒号:，触发 SyntaxError。for 和 while 的语句头都必须以冒号结尾，下一行缩进的才是循环体。',
        },
        {
          kind: 'fill',
          prompt: '补全代码，让循环能正常结束（填运算符）：',
          code: 'count = 0\nwhile count < 3:\n    print(count)\n    count ___ 1',
          answers: ['+=', '= count +'],
          placeholder: '让 count 每轮加 1',
          hint: '两种写法都行：复合赋值运算符，或先加再赋值。',
          explain: 'count += 1 是 count = count + 1 的简写。while 循环体里必须更新条件涉及的变量，否则条件永远不变，变成死循环。',
        },
        {
          kind: 'choice',
          prompt: '下面这段代码会怎样？',
          code: 'count = 0\nwhile count < 3:\n    print(count)',
          options: ['输出 0、1、2 后正常结束', '一直输出 0，停不下来', '输出 0 后报错', '什么都不输出'],
          answerIndex: 1,
          hint: '循环体里有没有人去改 count？',
          explain: '循环体只有 print(count)，count 从 0 开始且永远不会变，条件 count < 3 永远为 True——这就是死循环。在终端按 Ctrl + C 才能强行中断。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'n = 5\nwhile n > 0:\n    print(n)\n    n -= 1',
          options: ['5\n4\n3\n2\n1', '5\n4\n3\n2\n1\n0', '1\n2\n3\n4\n5', '0\n1\n2\n3\n4\n5'],
          answerIndex: 0,
          hint: 'n 从 5 开始递减，条件是 n > 0。',
          explain: 'n 从 5 开始，每轮先 print 再减 1。n 为 5、4、3、2、1 时条件成立，输出 5、4、3、2、1；n 变 0 时 0 > 0 不成立，循环结束。这就是倒计数模式。',
        },
      ],
    },

    // ============ 3-3 break / continue ============
    {
      id: '3-3',
      name: '逃生门',
      xp: 48,
      gold: 17,
      learn: {
        title: 'break 与 continue：循环里的两扇门',
        body: [
          'break 是"紧急逃生门"：碰到它，整个循环立刻结束，后面的轮次全不跑。常用于"找到了就停"。',
          'continue 是"这轮跳过"：跳过本轮循环体里剩下的语句，直接进入下一轮。常用于"某种情况不做处理，其余照常"。',
          '嵌套循环里，break 只结束它所在的那一层循环——内层 break 只跳出内层，外层循环照常继续。',
        ],
        code: 'for i in range(5):\n    if i == 3:\n        break       # i 为 3 时整个循环结束，输出 0、1、2\n    print(i)\n\nfor i in range(5):\n    if i == 2:\n        continue      # i 为 2 时跳过本轮，输出 0、1、3、4\n    print(i)',
      },
      questions: [
        {
          kind: 'choice',
          prompt: 'break 和 continue 的区别是？',
          options: ['break 跳过本轮，continue 结束循环', 'break 结束整个循环，continue 只跳过本轮', '两者完全一样', 'break 只能用在 while 里'],
          answerIndex: 1,
          hint: '一个是"全退出"，一个是"跳过本轮"。',
          explain: 'break 直接结束整个循环，后面的轮次全不跑；continue 只跳过本轮剩余语句，循环继续下一轮。两者都既可用于 for 也可用于 while。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'for i in range(5):\n    if i == 3:\n        break\n    print(i)',
          options: ['0\n1\n2', '0\n1\n2\n3', '0\n1\n2\n3\n4', '3'],
          answerIndex: 0,
          hint: 'i 等于 3 时发生了什么？3 本身会被打印吗？',
          explain: 'i 依次取 0、1、2、3。当 i 为 3 时 break 触发，循环立即结束——break 在 print(i) 之前执行，所以 3 没被打印。输出 0、1、2。',
        },
        {
          kind: 'fill',
          prompt: '补全关键字，让循环跳过 i 等于 2 的本轮：',
          code: 'for i in range(5):\n    if i == 2:\n        ___\n    print(i)',
          answers: ['continue'],
          placeholder: '「跳过本轮」的关键字',
          hint: '八个字母，意为「继续下一轮」。',
          explain: 'continue 让本轮的 print(i) 被跳过，直接进入下一轮。所以输出 0、1、3、4（2 不出现）。和 break 不同，break 是整个循环退出。',
        },
        {
          kind: 'order',
          prompt: '把这些行排成正确顺序，输出「跳过 j==1」的内层 + 跳外层 i==2：',
          lines: [
            'for i in range(3):',
            '    if i == 2: continue',
            '    for j in range(3):',
            '        if j == 1: continue',
            '        print(i, j)',
          ],
          hint: '外层判一次，内层再判一次，最后打印。',
          explain: '外层用 continue 跳过整轮 i==2（内层也不会跑），内层用 continue 跳过 j==1 这一轮——剩下的 print 会输出 (0,0)、(0,2)、(1,0)、(1,2)。continue 只跳当前所在那一层的当前一轮，不会中断整个嵌套循环。',
        },
        {
          kind: 'bug',
          prompt: '下面这段循环代码会出什么问题？',
          code: ['n = 0', 'while n < 3:', '    print(n)'],
          answerLine: 2,
          hint: 'n 永远不会变，会发生什么？',
          explain: '第 3 行只 print，没改 n；n 永远等于 0，循环条件 n<3 永远成立——无限循环。死循环得按 Ctrl+C 强退，或者补一行 n = n + 1。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'for i in range(5):\n    if i % 2 == 0:\n        continue\n    print(i)',
          options: ['1\n3', '0\n1\n2\n3\n4', '0\n2\n4', '1\n3\n5'],
          answerIndex: 0,
          hint: 'i 是偶数时被跳过了，剩下的就是奇数。',
          explain: 'i 为偶数（0、2、4）时 continue 触发，跳过本轮的 print(i)；i 为奇数（1、3）正常打印。所以输出 1、3。这是"过滤"模式：循环里加条件 + continue。',
        },
      ],
    },

    // ============ 3-B Boss: 循环洞窟全线综合 ============
    {
      id: '3-B',
      name: '循环洞窟大测验',
      xp: 120,
      gold: 50,
      boss: true,
      learn: {
        title: 'Boss：循环洞窟全线复习',
        body: [
          '这一关没有新知识。6 道题覆盖 for、range 三参数、while 计数器、break、continue、嵌套循环——答错会当场给解析，放心冲。',
          '全对零提示才能拿到 ★★★ 和完整战利品。整理好你的循环咒语，出发！',
        ],
      },
      questions: [
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'for i in range(2, 10, 3):\n    print(i)',
          options: ['2\n5\n8', '2\n5\n8\n11', '2\n3\n4\n5', '0\n3\n6\n9'],
          answerIndex: 0,
          hint: '从 2 开始，每次加 3，到 10 之前停。',
          explain: 'range(2, 10, 3) 从 2 出发，步长 3：2、5、8，下一个 11 超过 10 所以不包含。含头不含尾，步长决定跳跃幅度。',
        },
        {
          kind: 'fill',
          prompt: '补全累加器代码，让它算 1 到 100 的和（填一个函数名）：',
          code: 'total = 0\nfor i in ___(1, 101):\n    total = total + i',
          answers: ['range'],
          placeholder: '生成一串数字的内建函数',
          hint: '它能生成从 1 到 100 的整数序列（含头不含尾）。',
          explain: 'range(1, 101) 生成 1 到 100，循环把每个数累加到 total。range 是 for 循环最经典的搭档——负责生成"要循环的数字"。',
        },
        {
          kind: 'bug',
          prompt: '下面两行里，哪一行会报错？',
          code: ['for i in range(3):', '    msg = "第" + i + "关"'],
          answerLine: 1,
          hint: 'i 是什么类型？字符串能直接加它吗？',
          explain: '第 2 行 "第" + i 里 i 是整数（range 产生整数），字符串不能和整数相加，触发 TypeError。要写 f"第{i}关" 或 "第" + str(i) + "关"——这是循环里最常见的报错之一。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'n = 1\nwhile n < 10:\n    print(n)\n    n *= 2',
          options: ['1\n2\n4\n8', '1\n2\n4\n8\n16', '2\n4\n8\n16', '1\n2\n4\n8\n16\n32'],
          answerIndex: 0,
          hint: 'n 每次翻倍，条件是 n < 10。',
          explain: 'n 从 1 开始，每轮先 print 再翻倍。n 为 1、2、4、8 时条件成立，输出 1、2、4、8；n 变 16 时 16 < 10 不成立，循环结束。',
        },
        {
          kind: 'choice',
          prompt: '下面这段嵌套循环里，break 会跳出几层？',
          code: 'for i in range(3):\n    for j in range(3):\n        if j == 1:\n            break\n        print(i, j)',
          options: ['只跳出内层循环', '跳出两层循环', '跳出整个程序', '什么都不做'],
          answerIndex: 0,
          hint: 'break 只管它所在的那一层循环。',
          explain: 'break 只结束它所在的最近一层循环。内层的 break 退出内层 for，外层 for 照常继续——所以外层 i 会跑满 3 轮。',
        },
        {
          kind: 'output',
          prompt: '这段嵌套循环运行后输出什么？',
          code: 'for i in range(2):\n    for j in range(2):\n        print(i, j)',
          options: ['0 0\n0 1\n1 0\n1 1', '0 0\n1 1', '0 1\n1 0', '0 0\n0 1\n1 1\n2 2'],
          answerIndex: 0,
          hint: '外层每跑一轮，内层完整跑一遍。',
          explain: '外层 i 取 0 时，内层 j 跑 0、1；外层 i 取 1 时，内层 j 再跑 0、1。输出四行：0 0、0 1、1 0、1 1。嵌套循环的总次数 = 外层次数 × 内层次数。循环洞窟，通关！',
        },
      ],
    },
  ],
}