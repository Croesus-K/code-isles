import type { RegionDef } from '../course'

/**
 * 区域 4：列表湖（高效入门版）
 *
 * 每关 4-5 题 = 1 选择 + 1 输出 + 1 填空 + 1 改错 (+ 可选 应用)，
 * 螺旋复习 region1-3 的变量、循环、字符串格式化。
 */
export const region4: RegionDef = {
  id: '4',
  name: '列表湖',
  tagline: '一网打尽一串宝物',
  levels: [
    // ============ 4-1 列表创建与索引 ============
    {
      id: '4-1',
      name: '宝物船',
      xp: 45,
      gold: 16,
      learn: {
        title: '列表：一串宝物的容器',
        body: [
          '列表就像一艘宝物船：用方括号 [] 把多个宝物按顺序装在一起，items = ["剑", "盾", "药水"] 就是一艘装了三件宝物的船。',
          '取宝物用索引：items[0] 是第一件，items[1] 是第二件——索引从 0 开始，不是 1。负索引从末尾倒数：items[-1] 就是最后一件，不用先数有多长。',
          'len(items) 告诉你船上有几件宝物。访问不存在的位置会触发 IndexError——最大合法索引是 len - 1，越界一步就翻船。',
        ],
        code: 'items = ["剑", "盾", "药水"]\nitems[0]    # → "剑"（索引从 0 开始）\nitems[-1]   # → "药水"（最后一个）\nlen(items)  # → 3',
      },
      questions: [
        {
          kind: 'choice',
          prompt: '下列哪一行创建了一个列表？',
          options: ['hp = (1, 2, 3)', 'bag = [1, 2, 3]', 'bag = {1, 2, 3}', 'bag = "1, 2, 3"'],
          answerIndex: 1,
          hint: '列表用一对方括号包起来。',
          explain: '列表的字面量用方括号 []；( ) 是元组，{ } 是集合或字典，引号包起来的是字符串。只有 [1, 2, 3] 是列表。',
        },
        {
          kind: 'fill',
          prompt: '补全代码，取出列表中的「盾」（填一个数字）：',
          code: 'bag = ["剑", "盾", "药水"]\nshield = bag[___]   # → "盾"',
          answers: ['1'],
          placeholder: '一个数字',
          hint: '「盾」是第几个元素？记住索引从 0 开始数。',
          explain: '「剑」是 bag[0]，「盾」是 bag[1]——索引从 0 开始，所以第二个元素的索引是 1，不是 2。这是新手最容易踩的坑。',
        },
        {
          kind: 'bug',
          prompt: '下面两行里，哪一行会报错？',
          code: ['bag = ["剑", "盾"]', 'print(bag[2])'],
          answerLine: 1,
          hint: '只有 2 个元素的列表，最大的索引是多少？',
          explain: '第 2 行 bag[2] 越界：列表只有 2 个元素（索引 0 和 1），访问 bag[2] 触发 IndexError。最大合法索引 = len - 1 = 1，取最后一个元素用 bag[-1] 最保险。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'bag = ["剑", "盾", "药水"]\nlen(bag)',
          options: ['2', '3', '4', '报错'],
          answerIndex: 1,
          hint: '数一数列表里有几个元素。',
          explain: 'len(bag) 返回列表的元素个数：3 个。注意：最后一个元素的索引是 2，不是 3——长度和最大索引永远差 1。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'bag = ["剑", "盾", "药水"]\nbag[-1]',
          options: ['「剑」', '「盾」', '「药水」', '报错'],
          answerIndex: 2,
          hint: '负号的意思是「从右边倒数」。',
          explain: '负索引从末尾倒着数：-1 是最后一个，-2 是倒数第二个。bag[-1] = 「药水」。这比写 bag[2] 方便，因为你不用先数列表有多长。',
        },
      ],
    },

    // ============ 4-2 增删改查 ============
    {
      id: '4-2',
      name: '船舱管理',
      xp: 48,
      gold: 17,
      learn: {
        title: '增删改查：管理船舱里的宝物',
        body: [
          'append 在列表末尾追加一个元素：bag.append("弓") 把「弓」放到最后。remove 按内容删除：bag.remove("盾") 会找到「盾」并删掉，但列表里没有这个值时会抛出 ValueError。',
          'pop 弹出末尾的元素并返回它的值：item = bag.pop() 既取走又拿到。按位置修改直接赋值：bag[1] = "弓" 把索引 1 位置上的元素换成「弓」。',
          '记住：append、remove、pop 都直接修改原列表本身，不返回新列表。',
        ],
        code: 'bag = ["剑", "盾"]\nbag.append("药水")   # bag → ["剑", "盾", "药水"]\nbag.remove("盾")    # bag → ["剑", "药水"]\nitem = bag.pop()    # item → "药水"，bag → ["剑"]\nbag[0] = "弓"       # bag → ["弓"]',
      },
      questions: [
        {
          kind: 'fill',
          prompt: '补全代码，在列表末尾添加「盾」（填方法名）：',
          code: 'bag = ["剑"]\nbag.___("盾")   # bag → ["剑", "盾"]',
          answers: ['append'],
          placeholder: '六个字母的方法名',
          hint: '意思是「追加」，以字母 a 开头。',
          explain: 'append 是列表最常用的方法：在末尾追加一个元素。它修改原列表本身，返回 None（不是新列表）——这是和字符串方法最大的区别。',
        },
        {
          kind: 'bug',
          prompt: '下面两行里，哪一行会报错？',
          code: ['bag = ["剑", "盾"]', 'bag.remove("药水")'],
          answerLine: 1,
          hint: 'remove 按内容删，找不到就麻烦了。',
          explain: 'remove 按值删除，但列表里根本没有「药水」，抛出 ValueError。删除前最好先用 in 检查元素是否存在。',
        },
        {
          kind: 'output',
          prompt: '执行后 bag 和 taken 分别是？',
          code: 'bag = ["剑", "盾", "药水"]\ntaken = bag.pop()',
          options: [
            'bag=["剑", "盾", "药水"], taken=None',
            'bag=["剑", "盾"], taken="药水"',
            'bag=["药水"], taken="剑"',
            '报错',
          ],
          answerIndex: 1,
          hint: 'pop 弹出的是哪个位置的元素？',
          explain: 'pop() 不带参数时弹出列表最后一个元素并返回它。taken 拿到「药水」，同时 bag 变成 ["剑", "盾"]。pop 既能取走元素又能拿到它的值，一举两得。',
        },
        {
          kind: 'output',
          prompt: '执行后 bag 的内容是？',
          code: 'bag = ["剑", "盾", "药水"]\nbag[1] = "弓"',
          options: ['["剑", "弓", "药水"]', '["弓", "盾", "药水"]', '["剑", "盾", "药水", "弓"]', '报错'],
          answerIndex: 0,
          hint: '给 bag[1] 赋新值，替换的是哪个位置？',
          explain: 'bag[1] = "弓" 把索引 1 位置上的元素替换成「弓」。「盾」被覆盖，列表变成 ["剑", "弓", "药水"]。这是原地修改，不会增加元素个数。',
        },
        {
          kind: 'order',
          prompt: '把三行排成正确的顺序，让最后 bag 是 ["剑", "盾"]：',
          lines: ['bag = []', 'bag.append("剑")', 'bag.append("盾")'],
          hint: '空列表得先创建，然后才能往里放东西。',
          explain: '先用 [] 创建空列表，再依次 append。append 的顺序就是元素在列表里的排列顺序：先「剑」后「盾」，最后得到 ["剑", "盾"]。',
        },
      ],
    },

    // ============ 4-3 切片 + in ============
    {
      id: '4-3',
      name: '切片刀',
      xp: 50,
      gold: 18,
      learn: {
        title: '切片：从宝物串上切一段下来',
        body: [
          '切片用 [a:b] 从列表里截取一段：bag[1:3] 取索引 1 到 3 之前的元素——含头不含尾，起点包含、终点不包含。',
          '省略写法很方便：bag[:2] 从头取到索引 2 之前，bag[2:] 从索引 2 取到末尾。in 判断元素在不在列表里：「药水」in bag 返回 True 或 False。',
          '关键：切片永远产生一个新列表，不会改动原列表。original[:] 能复制整个列表，改副本不影响原件。',
        ],
        code: 'bag = ["剑", "盾", "药水", "弓", "火把"]\nbag[1:3]      # → ["盾", "药水"]（含头不含尾）\nbag[:2]       # → ["剑", "盾"]（省略起点=从头）\nbag[2:]       # → ["药水", "弓", "火把"]（省略终点=到尾）\n"弓" in bag   # → True\ncopy = bag[:]  # copy 是全新列表，改 copy 不影响 bag',
      },
      questions: [
        {
          kind: 'fill',
          prompt: '补全代码，取列表前两个元素（填切片表达式）：',
          code: 'bag = ["剑", "盾", "药水", "弓"]\nfront = bag[___]   # → ["剑", "盾"]',
          answers: [':2', '0:2'],
          placeholder: '冒号和数字',
          hint: '从头开始可以省略起点，终点写几？',
          explain: 'bag[:2] 省略起点表示从 0 开始，取到索引 2 之前，结果 ["剑", "盾"]。写 bag[0:2] 效果一样——省略起点只是简写。',
        },
        {
          kind: 'output',
          prompt: '这段代码运行后输出什么？',
          code: 'bag = ["剑", "盾", "药水"]\nbag[1:1]',
          options: ['["盾"]', '["剑"]', '[]', '报错'],
          answerIndex: 2,
          hint: '起点等于终点会怎样？',
          explain: 'bag[1:1] 起点终点相同，结果是空列表 []。切片含头不含尾，起点终点相等就是"取零个元素"。',
        },
        {
          kind: 'bug',
          prompt: '下面两行里，哪一行会报错？',
          code: ['bag = ["剑", "盾", "药水"]', 'bag[1:3] = "弓"'],
          answerLine: 1,
          hint: '切片赋值时，等号右边应该是什么？',
          explain: '第 2 行把字符串赋值给切片——切片赋值要求右边是可迭代对象（列表/元组/字符串之一）且长度匹配。正确写法：bag[1:3] = ["弓"]。',
        },
        {
          kind: 'output',
          prompt: '执行后 output 的内容是？',
          code: 'original = ["剑", "盾", "药水"]\ncopy = original[:]\ncopy.append("弓")\noriginal',
          options: ['["剑", "盾", "药水"]', '["剑", "盾", "药水", "弓"]', '["弓"]', '报错'],
          answerIndex: 0,
          hint: '切片会造出一份新的，还是改原来的？',
          explain: 'original[:] 是完整切片，产生一份全新的列表副本。copy.append("弓") 只改了 copy，original 不受影响，仍是 ["剑", "盾", "药水"]。切片永远不改原列表。',
        },
        {
          kind: 'fill',
          prompt: '补全代码，填可迭代类型——把字符串拼成列表：',
          code: 'bag = ["剑", "盾", "药水", "弓"]\nfirst = bag[1]___2     # → "药水"',
          answers: [':'],
          placeholder: '冒号',
          hint: '想取单个元素用索引 [1]，想取连续一段用切片 [a:b]。',
          explain: 'bag[1:2] 是切片（含头不含尾），结果 ["药水"]——单元素列表。要拿到单元素值用 bag[1]（不用冒号）。',
        },
      ],
    },

    // ============ 4-B Boss: 列表湖全线综合 ============
    {
      id: '4-B',
      name: '列表湖大测验',
      xp: 130,
      gold: 55,
      boss: true,
      learn: {
        title: 'Boss：列表湖全线复习',
        body: [
          '这一关没有新知识。6 道题覆盖列表创建、索引、增删改查、切片、列表与循环的组合——答错会当场给解析，放心冲。',
          '全对零提示才能拿到 ★★★ 和完整战利品。扬帆起航，拿下列表湖！',
        ],
      },
      questions: [
        {
          kind: 'output',
          prompt: '执行后 result 是什么？',
          code: 'nums = [1, 2, 3, 4, 5]\nresult = nums[1:4]',
          options: ['[1, 2, 3, 4]', '[2, 3, 4]', '[2, 3, 4, 5]', '[1, 2, 3, 4, 5]'],
          answerIndex: 1,
          hint: '含头不含尾。',
          explain: 'nums[1:4] 从索引 1 取到索引 4 之前：[2, 3, 4]。nums[4]=5 不包含。这是切片的"含头不含尾"规则。',
        },
        {
          kind: 'fill',
          prompt: '补全代码，取出列表的最后一个元素（填一个数字）：',
          code: 'bag = ["剑", "盾", "药水"]\nlast = bag[___]   # → "药水"',
          answers: ['-1'],
          placeholder: '一个负数',
          hint: '负索引从末尾倒数，最后一个用哪个数？',
          explain: 'bag[-1] 取最后一个元素「药水」。负索引从 -1 开始：-1 是末尾，-2 是倒数第二。比写 bag[len(bag)-1] 简洁得多。',
        },
        {
          kind: 'bug',
          prompt: '下面两行里，哪一行会报错？',
          code: ['bag = [1, 2, 3]', 'print(bag[3])'],
          answerLine: 1,
          hint: '列表长度是 3，能用索引 3 取吗？',
          explain: 'bag 只有 3 个元素，合法索引是 0、1、2。第 2 行 bag[3] 取不到，抛 IndexError: list index out of range。列表索引是 0~len-1，超界会当场报错。',
        },
        {
          kind: 'output',
          prompt: '执行后输出什么？',
          code: 'bag = ["剑", "盾", "药水"]\ntaken = bag.pop()\nprint(taken)',
          options: ['「药水」', '「剑」', 'None', '["剑", "盾"]'],
          answerIndex: 0,
          hint: 'pop 弹出的是末尾的哪个元素？',
          explain: 'pop() 弹出最后一个元素并返回它。taken 拿到「药水」，同时 bag 变成 ["剑", "盾"]。print 输出的是 taken 的值「药水」，不是 bag。',
        },
        {
          kind: 'fill',
          prompt: '补全代码，在列表末尾追加一个元素（填方法名）：',
          code: 'bag = ["剑"]\nbag.___("盾")\nlen(bag)',
          answers: ['append'],
          placeholder: '六个字母',
          hint: '意为「追加」。',
          explain: 'append("盾") 在列表末尾添加「盾」，列表从 1 个元素变成 2 个，len(bag)=2。',
        },
        {
          kind: 'output',
          prompt: '执行后 output 的内容是？',
          code: 'nums = [1, 2, 3]\ndoubled = [x * 2 for x in nums]\nsum(doubled)',
          options: ['6', '12', '[2, 4, 6]', '报错'],
          answerIndex: 1,
          hint: '[x*2 for x in nums] 是列表推导式，对每个元素乘 2。',
          explain: '[x*2 for x in nums] 把 nums 元素挨个乘 2 得到 [2, 4, 6]，再 sum() 求和：2+4+6=12。列表推导式 + sum 是处理数据的经典组合。',
        },
      ],
    },
  ],
}