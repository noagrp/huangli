# 黄历知识

Traditional Chinese almanac terminology reference for the noagrp 中 collection.

## Structure

- `data/huangli-terms.json` — reusable knowledge data
- `src/huangli-engine.js` — lookup/search/explanation engine
- `index.html` — human-facing reference site

## Current scope

- 宜 / 忌
- 冲 / 煞 / 六冲
- 胎神 / 胎神占方
- 十二值星
- 喜神 / 财神 / 福神

## Browser usage

```html
<script src="./src/huangli-engine.js"></script>
<script>
  const engine = await loadHuangliEngine('./data/huangli-terms.json');

  console.log(engine.getTerm('冲'));
  console.log(engine.getTerm('开'));
  console.log(engine.getCategory('zhixing'));
  console.log(engine.search('财神'));

  console.log(engine.explain({
    yi: ['祭祀', '出行'],
    chong: '猴',
    sha: '北',
    zhixing: '开',
    taishen: '厨灶炉外正南'
  }));
</script>
```

## Data principle

The project explains traditional almanac terminology and cultural usage. Traditional interpretations are kept distinct from scientific or practical advice.
