import type { RegionDef } from '../course'

/**
 * 区域 1：变量平原（高效入门版）
 *
 * 设计目标：让新手最快最高效地掌握 Python 入门三件套——
 * 变量、数字与运算符、字符串。
 *
 * 节奏：每关 3-4 道题 = 1 选择（确认理解）+ 1 输出/Bug（实战）+ 1 应用（写代码片段）。
 * 螺旋复习：每关会用上前关的概念（例：1-3 字符串题里出现 f-string 嵌入数字，复用 1-2 的运算）。
 */
export const region1: RegionDef = {
  id: '1',
  name: '变量平原',
  tagline: '冒险从给宝箱贴标签开始',
  levels: [
    // ============ 1-1 变量：声明、更新与命名 ============
    {
      id: '1-1',
      name: '贴标签的宝箱',
      xp: 30,
      gold: 10,
      learn: {
        title: '变量：给数据贴上标签',
        body: [
          '变量就像贴了标签的宝箱：name = "冒险者" 表示把字符串「冒险者」放进名叫 name 的宝箱里。',
          '赋值用单个等号 =，含义是「把右边的东西放进左边的宝箱」，不是数学里的"相等"。',
          '命名规则：只能含字母、数字、下划线，且不能以数字开头；区分大小写，hp 和 Hp 是两个不同的宝箱。',
        ],
        code: 'name = "冒险者"\nhp = 100\nhp = hp + 10      # 拿出 hp 里的数，加上 10，再放回去',
      },
      questions: [
        {
          kind: 'choice',
          prompt: '下面哪个变量名是合法的？',
          options: ['2nd_place', 'my_gold', 'my-gold', 'class'],
          answerIndex: 1,
          hint: '合法 = 字母/数字/下划线 + 不以数字开头 + 不是关键字。',
          explain: '2nd_place 以数字开头 ✗；my-gold 含连字符 ✗（会被当成减法）；class 是 Python 保留关键字 ✗；只有 my_gold 完全合法。',
        },
        {
          kind: 'output',
          prompt: '执行后 hp 是多少？',
          code: 'hp = 100\nhp = hp + 10',
          options: ['100', '110', '90', '报错'],
          answerIndex: 1,
          hint: '等号右边先算完，再放进左边的宝箱。',
          explain: '先把右边的 hp + 10 算出来（100 + 10 = 110），再放进左边叫 hp 的宝箱。最后宝箱里是 110 —— 这就是"更新"变量的标准写法。',
        },
        {
          kind: 'bug',
          prompt: '下面哪一行会报错？',
          code: ['1st_place = "冠军"', 'print(1st_place)'],
          answerLine: 0,
          hint: '变量名的第一个字符有规则。',
          explain: '第 1 行：变量名必须以字母或下划线开头，1st_place 以数字开头会触发 SyntaxError。要改成 first_place 或 _1st_place。',
        },
        {
          kind: 'fill',
          prompt: '补全赋值运算符，把 5 放进名为 score 的宝箱：',
          code: 'score ___ 5   # 把 5 存进名为 score 的变量',
          answers: ['='],
          placeholder: '一个符号',
          hint: '把右边的值放进左边的宝箱，用哪个符号？',
          explain: '= 是赋值符号，把右边的值放进左边的变量名：score = 5 之后，score 这个宝箱里就装了 5。= 不是数学上的"等于"，它的意思是"存进"。',
        },
        {
          kind: 'output',
          prompt: '执行后 b 是多少？',
          code: 'a = 3\nb = a\na = 7',
          options: ['7', '3', '10', '报错'],
          answerIndex: 1,
          hint: 'b = a 是复制"当时"的值，之后 a 改了不影响 b。',
          explain: 'b = a 时，把 a "当时"的值 3 复制给 b。之后 a 改成 7，但 b 早就存好了 3。这是新手最容易踩的"复制"误区：变量之间赋值是拷贝值，不是绑定同一个宝箱。',
        },
      ],
    },

    // ============ 1-2 数字与运算符 ============
    {
      id: '1-2',
      name: '数字三兄弟',
      xp: 35,
      gold: 12,
      learn: {
        title: '数字与运算符：/ // % **',
        body: [
          'Python 最常用的两种数：整数（int）如 100，小数（float）如 3.5。',
          '基本运算：+ 加、- 减、* 乘、/ 除。三兄弟：// 整除（丢掉小数）、% 取余数（除完剩多少）、** 乘方（几次方）。',
          '记忆点：/ 永远得小数；// 抛小数；% 拿余数；** 算次方。',
        ],
        code: '7 / 2     # → 3.5     除法，永远是小数\n7 // 2    # → 3       整除，丢掉小数\n7 % 2     # → 1       余数\n2 ** 10   # → 1024    2 的 10 次方',
      },
      questions: [
        {
          kind: 'choice',
          prompt: '下面哪个运算符能算 2 的 8 次方？',
          options: ['2 ^ 8', '2 ** 8', '2 * 8', '2 // 8'],
          answerIndex: 1,
          hint: '次方不是 ^，^ 在 Python 里另有含义。',
          explain: '** 是乘方运算符：2 ** 8 = 256。Python 里 ^ 是按位异或，* 是乘法，// 是整除，都不是次方。新手最常见的拼写错误。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: '10 / 5',
          options: ['整数 2', '小数 2.0', '报错', '字符串「2」'],
          answerIndex: 1,
          hint: '/ 永远不返回整数。',
          explain: '只要用了 /，结果一定是小数（float）：10 / 5 得 2.0 而不是 2。想要整数商请用 //。这是新手最容易踩的坑之一——分数的"结果是 2.0，不是 2"。',
        },
        {
          kind: 'fill',
          prompt: '补全运算符，判断一个数 n 是不是偶数（偶数返回 0）：',
          code: 'n = 7\nn ___ 2     # 想得到 0 表示偶数',
          answers: ['%'],
          placeholder: '取余数用哪个运算符',
          hint: '7 除以 2 余几？用哪个符号能拿到余数？',
          explain: '% 是取余运算符：n % 2 为 0 就说明 n 能被 2 整除，是偶数；为 1 就是奇数。这是判断奇偶的标准写法。',
        },
        {
          kind: 'bug',
          prompt: '下面哪一行会报错？',
          code: ['x = 10', 'y = x / 0'],
          answerLine: 1,
          hint: '除法的右边不能是几？',
          explain: '第 2 行：x / 0 触发 ZeroDivisionError。任何数除以 0 都报错，包括 0/0 也是。先判断 y 是否为 0 再做除法，或者用 try/except 兜住。',
        },
        {
          kind: 'output',
          prompt: '执行后 total 是多少？',
          code: 'total = 0\nfor i in range(1, 4):\n    total = total + i',
          options: ['6', '10', '7', '3'],
          answerIndex: 0,
          hint: 'range(1, 4) 生成 1、2、3（含头不含尾），累加到 total 里。',
          explain: 'range(1, 4) 生成 1、2、3 三轮循环。每次把 total 加上当前的 i：0+1=1，1+2=3，3+3=6。这是最经典的"累加器"模式——后面学习循环时会反复用到。',
        },
      ],
    },

    // ============ 1-3 字符串 ============
    {
      id: '1-3',
      name: '会说话的卷轴',
      xp: 35,
      gold: 12,
      learn: {
        title: '字符串：让游戏开口说话',
        body: [
          '用引号包起来的文字就是字符串（str），单引号双引号都行："火把" 和 \'火把\' 是同一个东西。',
          '字符串也能做运算：+ 把两段文字拼起来，* 把文字重复几遍（"哈" * 3 = "哈哈哈"）。',
          'len("code") 数字符个数；f-string 把变量嵌进文字：f"金币:{gold}" 里的 {gold} 会自动换成变量的值——这是写冒险者信息卡的标准工具。',
        ],
        code: 'name = "冒险者"\ngold = 99\ntitle = f"{name} 的金币: {gold}"   # → 「冒险者 的金币: 99」\nlen("code")   # → 4\n"哈" * 3      # → 「哈哈哈」',
      },
      questions: [
        {
          kind: 'choice',
          prompt: '下面哪种写法能让 {name} 被替换成变量的值？',
          options: [
            '"你好, {name}"',
            "f'你好, {name}'",
            "'你好, ${name}'",
            "'你好, name'",
          ],
          answerIndex: 1,
          hint: '想替换变量值，字符串前必须有一个特殊字母。',
          explain: 'f-string：在字符串前加字母 f（或 F），里面的 {变量名} 会被自动替换成值。其他三种写法 {name} 都只是普通字符，不会替换。这是格式化字符串最常用的方式。',
        },
        {
          kind: 'bug',
          prompt: '下面哪一行会报错？',
          code: ['age = 12', '"我今年" + age + "岁"'],
          answerLine: 1,
          hint: '文字和数字是两种类型，+ 号不认识它们站在一起。',
          explain: '第 2 行：字符串只能拼接字符串，不能直接和整数相加。正确写法是 "我今年" + str(age) + "岁"，或用 f-string：f"我今年{age}岁"。这是新手最常遇见的 TypeError 之一。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'name = "月"\ngold = 99\nf"{name} 有 {gold} 金币"',
          options: [
            '「{name} 有 {gold} 金币」',
            '「月 有 99 金币」',
            '「月 有 gold 金币」',
            '报错',
          ],
          answerIndex: 1,
          hint: '注意字符串前那个字母 f。',
          explain: 'f-string 把 {} 里的变量名换成它的值，得「月 有 99 金币」。漏写 f 前缀 {name} 就只是普通字符，原样输出。',
        },
        {
          kind: 'fill',
          prompt: '补全函数名，让它数出字符串的字符个数：',
          code: '___("code")   # 想得到 4',
          answers: ['len'],
          placeholder: '三个字母的函数名',
          hint: '以字母 l 开头，意为 length（长度）。',
          explain: 'len() 返回字符串（后面还有列表）的字符个数。这是 Python 最常用的内建函数之一，几乎每个数据处理脚本都会用到。',
        },
      ],
    },

    // ============ 1-B Boss：变量+数字+字符串 综合实战 ============
    {
      id: '1-B',
      name: '变量平原大测验',
      xp: 90,
      gold: 35,
      boss: true,
      learn: {
        title: 'Boss：写出你的冒险者卡片',
        body: [
          '这一关没有新知识。4 道题覆盖变量、运算和字符串，让你把前 3 关的东西串起来 —— 答错会当场给解析，放心冲。',
          '全对零提示才能拿到 ★★★ 和完整战利品。整理行囊，出发！',
        ],
      },
      questions: [
        {
          kind: 'output',
          prompt: '执行后 hp 是多少？',
          code: 'hp = 100\nhp = hp - 30',
          options: ['70', '100', '-30', '报错'],
          answerIndex: 0,
          hint: '先算右边，再存回宝箱。',
          explain: '右边的 hp - 30 = 70，再放进 hp。这就是变量的"更新"操作 —— 取出当前值、运算、放回。',
        },
        {
          kind: 'fill',
          prompt: '补全运算符，让 9 除以 4 的余数参与到表达式中：',
          code: 'remainder = 9 ___ 4     # 想得到 1（余数）',
          answers: ['%'],
          placeholder: '取余数用哪个运算符',
          hint: '9 除以 4 商 2 余 1，余数怎么拿？',
          explain: '% 是取余运算符，9 % 4 得 1。整除和取余是一对搭档：商 × 除数 + 余数 = 被除数（2 × 4 + 1 = 9）。',
        },
        {
          kind: 'bug',
          prompt: '下面哪一行会报错？',
          code: ['msg = "你好" + "冒险者"', '"欢迎" + 42'],
          answerLine: 1,
          hint: '字符串和整数能用 + 拼起来吗？',
          explain: '第 2 行：字符串和整数不能用 + 直接拼，触发 TypeError。正确写法："欢迎" + str(42)，或用 f-string：f"欢迎{42}"。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'gold = 50\nmsg = f"金币: {gold + 10}"',
          options: [
            '「金币: {gold + 10}」',
            '「金币: 60」',
            '「金币: 50」',
            '报错',
          ],
          answerIndex: 1,
          hint: 'f-string 的 {} 里也能放算式。',
          explain: 'f-string 的 {} 里放表达式 gold + 10，先算出 60，再嵌入字符串，得「金币: 60」。f-string 里能写任何 Python 表达式 —— 变量、运算、函数调用都行。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'name = "冒险者"\nhp = 80\nf"{name} 剩余 HP: {hp}/100"',
          options: [
            '「冒险者 剩余 HP: 80/100」',
            '「name 剩余 HP: hp/100」',
            '「冒险者 剩余 HP: hp/100」',
            '报错',
          ],
          answerIndex: 0,
          hint: 'f-string 把 {} 里的变量替换成值。',
          explain: 'f-string 把 {name} 替换成 "冒险者"、{hp} 替换成 80，得到完整字符串「冒险者 剩余 HP: 80/100」。这是拼装冒险者信息卡的标准写法 —— 后面写脚本、生成报告都用得到。平原通关！',
        },
      ],
    },
  ],
}