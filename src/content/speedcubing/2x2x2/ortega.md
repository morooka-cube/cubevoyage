---
title: "Ortega Method 解説"
date: "2015-08-25"
order: 0
---
2015年8月現在でのavgWRは1.55秒。  
世界トップクラスは非公式2秒切りが当たり前の時代となっています。  
そこまで速くなるのは難しそう…でもそれなりには速くなりたい。  
そんなあなたに最適な222スピード競技導入としての解法が**Ortega method**です。  
Ortega methodではわずかなアルゴリズムのみを使用し、4~5秒のタイムをそれほど苦労すること無く出すことができ、極めれば3秒切りまで達成できます。  
222をこれから始めるにあたって、間違いなくオススメできる解法です。

文中に**Extra**が付いている部分は、はじめのうちは読み飛ばして構いません。  
7秒を安定して切れるようになった後に見るとよく理解できるはずです。

### 解法の流れ

##### **一面　→　OLL　→　PBL**

333ではクロス色を固定するのが基本ですが、222では6色全てを等しく扱いましょう。（CN）  
全般において、白黄/赤橙/青緑という３つの対面色関係を意識することが大事です。

### 一面

Ortega methodでの一面とは必ずしも完全一面である必要はありません。  
側面色を気にしない**不完全一面でも良しとする**ことで、簡単に揃えることができます。  
５手程度で揃う場合が多く、慣れればインスペクションタイムですべて先読みできるようになります。

基本的な作り方については[**動画**](https://www.youtube.com/watch?v=qD3Zhll__Bo)を見てください。自由度が高いので自分なりに工夫してみましょう。

**Extra**  
インスペクションタイムで一面とその側面ペア、さらにOLLまで読めるとOrtega methodの熟練者と言えるでしょう。  
簡単なスクランブルの場合は複数の色について先読みし、もっとも簡単なルートを選びます。  
このとき完全一面を選択すればOLL後に1/6の確率でPBLskipを呼び込めます。  
COLLを知らずとも高確率でタイム短縮が狙えるため、大会で単発ベストを狙うならば悪くない選択です。

### OLL

333と同じです。  
既知の手順を流用してもいいですが、一部ではより簡単な手順が使えます。  
具体的な手順は動画を見てください。

<table class=" aligncenter"><tbody><tr><td><strong><a href="https://www.youtube.com/watch?v=TCPISZ880Ko" target="_blank">Sune</a></strong></td><td><strong>R U R' U R U2 R'</strong></td><td></td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=oZo5GWmMISk" target="_blank">Anti-Sune</a></strong></td><td><strong>R U2 R' U' R U' R'</strong></td><td></td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=BhMTgemN3OQ" target="_blank">T</a></strong></td><td><strong>R U R' U' R' F R F'</strong></td><td></td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=LjVnh0gtVE8" target="_blank">L</a></strong></td><td><strong>F R' F' R U R U' R'</strong></td><td>F R U' R' U' R U R' F' も可</td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=7EziTjW4hgo" target="_blank">U</a></strong></td><td><strong>F (R U R' U') F'</strong></td><td>333で最も簡単な6手OLL</td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=cmObq5W0S14" target="_blank">Pi</a></strong></td><td><strong>F (R U R' U')(R U R' U') F'</strong></td><td>Uを２回繰り返す</td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=MoIVcmzWHXM" target="_blank">H</a></strong></td><td><strong>R2 U2 R' U2 R2</strong></td><td>222専用の簡易手順</td></tr></tbody></table>

**Extra**  
Ortegaの範疇を超えますが、COLL(222では**CLL**とも呼びます)も合わせて習得しておくと効果的です。  
333で言うところのエッジが全て揃っているOLLが回しやすいですが、222ではエッジの状態を自由に設定することができるため、COLL以外の333用OLLでも222限定COLLとみなして使えます。

また、COLLが使えないまでもOLLCP判断ができるとかなり有利です。  
特に、COLLとして使えるPLL skipの形だけでも覚えておくと、予期しないスキップに遭遇して慌てるもったいないミスをなくせます。

**Extra**  
エッジにも副作用がある手順、また一面に副作用を与えるOLLも使えます。  
例えば[R’ F R2 U’ R2 F R](https://www.youtube.com/watch?v=IDrYIeQwyx4)が有名です。  
副作用が起きた後の変化を理解できれば何も問題はないので、上級者は皆こちらの手順を使っています。  
このように下段にも影響を与えるCOLLをすべて暗記する解法がEG methodで、世界レベルのsub2競技者が使用しています。  
日本語での解説としては、[荒木さんによるもの](https://github.com/speedsolve/2x2x2/blob/master/2x2x2.md)があります。

### PBL

このPBLがOrtega　methodの一番重要な部分です。  
BとはBothの略で、上段と下段の両方にPLLを行うことを意味します。  
PLLを２回行うよりも**格段に効率的な解法**です。

PBLの理解のために、**ペア**という簡単な概念を導入します。  
ペアとは一面の側面に同じ色のステッカーが２つ隣り合っている状態のことです。

表１には、ある一面を揃えた場合の側面色ペアの数とその確率を示しています。

**表１　３種類のペア数と発生確率**  
[![PBLchart](~/assets/2015/08/PBLchart-300x223.png)](~/assets/2015/08/PBLchart.png)

OLLまで終わっていれば上段と下段の２面が揃っていて、その両方の側面についてペアの概念を考えることができます。  
上段と下段の組み合わせをまとめたものが表２です。

**表２　上下段のペア組み合わせによる手順とその確率**  
[![PBLprobability](~/assets/2015/08/PBLprobability-300x226.png)](~/assets/2015/08/PBLprobability.png)

PLLは既知なので、新たに覚えるべき手順は３つのPBLとなります。  
下と上の側面にあるペアを両方ともB面に持って行き、手順を回します。

<table><tbody><tr><td><strong><a href="https://www.youtube.com/watch?v=TJenFndc9B4" target="_blank">隣接PLL</a></strong></td><td><strong>R U2 R' U' R U2 L' U R' U' L</strong></td><td>J-perm T/Apermでも可</td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=00Y9YROb-ec" target="_blank">対角PLL</a></strong></td><td><strong>R U' R' U' F2 U' R U R' U F2</strong></td><td style="text-align: left;">222専用手順　Y/Npermでも可</td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=VY9RsyA1ZKY" target="_blank">PBL 1</a></strong></td><td><strong>R2 B2 R2</strong></td><td>上段、下段ともにペアなし</td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=QancBthHSpw" target="_blank">PBL 2</a></strong></td><td><strong>R' U R' F2 R F' R</strong><br>もしくは<strong>L U' R U2 L' U R'</strong></td><td>上段にペア１、下段はペアなし</td></tr><tr><td><strong><a href="https://www.youtube.com/watch?v=AoodG7o5qVw" target="_blank">PBL 3</a></strong></td><td><strong>R2 U' R2 U2 F2 U' R2</strong></td><td>上限、下段ともにペア１</td></tr></tbody></table>

PBL1は短く回しやすいのですが、出現確率の低いパターンです。  
PBL2も速く回すことができます。余裕があれば[開始面違いの別手順](https://www.youtube.com/watch?v=l05rWL8sJ28&edit=vd)も覚えましょう。  
PBL3は約50%の高確率で出現するため、この手順が手に馴染んでいることが大事です。

**Extra**  
222ではLとRが相対的に同じ回転を示しています。  
記号通りに回すのではなく、キューブを少し傾けることで滑らかな指使いとなります。

PBLの手順の回しやすさの関係で、一面の側面ペアは０であることが好まれます。  
1/6の確率で最も回しづらい“ひっくり返して対角PLL”になってしまいますが、  
5/6は簡単なPBL1,2となります。  
一面作成の際に複数のルートを読めた場合の参考になるでしょう。

### ５秒切りのコツ

指のスピードがそれほど速くなくとも、5秒は先読みを鍛えることで誰もが切れるタイムです。  
333の実力ともあまり関係が無いため、努力が実りやすい競技と言えます。

初心者卒業の目安である５秒切りのためには、インスペクションタイムで一面とその側面ペア数が  
読めるのは当然として、簡単なケースではOLLの形まで読めると良いです。  
最初は15秒以上かかってしまってもかまわないので、じっくりパーツの移動先を考えてみましょう。  
Ortega methodに限らず、222ではインスペクションタイムをどれだけ有効利用できるかが勝負です。

２側面判断は必須スキルです。図１に２側面判断のコツをまとめています。  
対面色同士の関係を意識することが大事です。慣れれば簡単に裏側の状態を把握できます。

[![pair-decision](~/assets/2015/08/pair-decision-300x221.png)](~/assets/2015/08/pair-decision.png)  
**図１　ペアの２側面判断基準**

(2015/08/25 執筆者：[大村　周平](/author/#syu)）
