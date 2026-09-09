// i18next 初始化必须先于其他任何模块体执行。
//
// ES 模块按源码顺序深度优先求值：main.tsx 中排在最前的 import，其模块体
// 会在后续 import（以及 main.tsx 自身的语句）之前完整执行完毕。
//
// 若把 initI18n() 写成 main.tsx 里的普通语句，它会在所有 import 求值之后
// 才运行。届时那些在模块级常量中调用 t() 的模块（例如被 Layout 静态导入
// 的 serverSettings）早已求值完毕，t() 返回 undefined，界面上会出现空白
// 或未翻译的文案 —— 这类问题排查起来相当隐蔽。
//
// 因此这里以模块副作用的形式完成初始化，并在 main.tsx 中作为首个 import。
import { initI18n } from '@/lib/i18n';

initI18n();
