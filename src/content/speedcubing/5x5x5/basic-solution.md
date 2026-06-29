---
title: "5x5x5 基本的な揃え方"
date: "2015-03-09"
order: 0
---
### 5x5x5のパーツ名称

![](@assets/2015/02/5x5x5-basic-solution-parts-1.gif)  
センターパーツ

![](@assets/2015/02/5x5x5-basic-solution-parts-2.gif)  
コーナーパーツ

![](@assets/2015/02/5x5x5-basic-solution-parts-3.gif)  
エッジパーツ

### 揃えるときの考え方（アウトライン）

![](@assets/2015/02/5x5x5-basic-solution-outline-1.gif)  
スクランブル状態

![](@assets/2015/02/5x5x5-basic-solution-outline-2.gif)  
(他のパーツは無視して)センターパーツを揃える

![](@assets/2015/02/5x5x5-basic-solution-outline-3.gif)  
エッジセット(リダクション・オオクサ式)

![](@assets/2015/02/5x5x5-basic-solution-outline-4.gif)  
5列を3列とみなして3x3x3の解法を用いる

### 5x5x5を解くのに必要な知識

3x3x3と4x4x4が解けることが大前提です。(4x4x4については32223などの拡張エッジセットが出来るとさらにわかりやすいでしょう)  
あと、このページは回転記号を用いておりますので回転記号が読めるようにしてください。(回転記号表は[こちら](/how-to-solve/intermediate/notation/))

### 4x4x4と5x5x5、どちらが難しい？

4x4x4のパターン数は7.4×10^46、一方5x5x5のパターン数は2.8×10^74と、5x5x5のほうが4x4x4よりも約3.8×10^27倍のパターン数を持つため、一般的に5x5x5は4x4x4よりもはるかに難易度が高いと考えられます。  
しかし上記したとおり、5x5x5にはパリティが発生しません。  
また、3x3x3同様、5x5x5の中心のパーツは位置関係が変わらないため、これに沿ってセンターパーツを揃えていけば、センターパーツの位置関係がズレることはありません。  
![](@assets/2015/02/5x5x5-basic-solution-4x4x4-1.gif)  
さて、これを踏まえて、4x4x4と5x5x5及びそれ以上のNxNxNパズルは、パズルの難易度としてはほぼ同じくらいと評価されることが多いです(TORIBOの「[難易度の目安](http://store.tribox.com/products/list.php?category_id=444)」でも、4x4x4〜7x7x7すべて★4つとされています)。  
この理由としましては、「揃える時の考え方」の複雑さがどれも同じだから、という点が挙げられます。  
上記したアウトラインを見て「あ、4x4x4と同じだ」と思った方もいるのではないでしょうか。  
実は4x4x4も5x5x5も7x7x7も100x100x100もほぼすべて同じ解き方で解くことができます。

当たり前ですがパズルの難易度を短絡的に「出現パターン数の量」や「解くのにかかる時間」で測るのであれば、  
5x5x5のほうが難易度が高いのは明らかですが。

### センターパーツを揃える

対色2面→側面→側面→ラスト2センター の順で揃えましょう。

まずは1面のみ揃えます。  
揃える時のコツですが、  
![](@assets/2015/02/5x5x5-basic-solution-center-1.gif)  
まず一面にセンターの2ペアをひとつ作り、別の面にも2ペアを作り、  
![](@assets/2015/02/5x5x5-basic-solution-center-2.gif)  
2x2の4ペアを作る  
![](@assets/2015/02/5x5x5-basic-solution-center-3.gif)  
別の面に2ペアを作り、  
![](@assets/2015/02/5x5x5-basic-solution-center-4.gif)  
2x3の6ペアに拡張  
![](@assets/2015/02/5x5x5-basic-solution-center-5.gif)  
別の面に3ペアを作り、  
![](@assets/2015/02/5x5x5-basic-solution-center-6.gif)  
3x3の9ペアを完成させる  
という流れがやりやすいです。  
この考え方はすべてのセンターで通用しますので、ぜひ物にしましょう。

次にさっき揃えたセンターがD面にくるよう持ち替え、反対側に対色となるセンターを揃えます。  
![](@assets/2015/02/5x5x5-basic-solution-center-7.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-8.gif)

センター2つ目～4つ目のヒント

![](@assets/2015/02/5x5x5-basic-solution-center-9.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-10.gif) Rw U Rw'

![](@assets/2015/02/5x5x5-basic-solution-center-11.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-12.gif) Rw U2 Rw'

続いて3つ目のセンターをまだ揃えていない適当な面に揃えます。  
既に揃えた対色2面をR面とL面にくるように持ち替え、Uw系及びDw系の回転をしないようにすれば、揃えた2面が崩れることはありません。  
![](@assets/2015/02/5x5x5-basic-solution-center-13.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-14.gif)

続いてさっき揃えた3面の隣に4つ目のセンターを揃えます。  
中心のパーツの色に従って次に揃えるセンターの色を決めましょう。  
![](@assets/2015/02/5x5x5-basic-solution-center-14.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-15.gif)

最後に残った2面を揃えましょう。1面を揃えれば残りの1面も勝手に揃ってくれます。

ラスト2センターのヒント  
![](@assets/2015/02/5x5x5-basic-solution-center-16.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-17.gif) M' U2 M  
![](@assets/2015/02/5x5x5-basic-solution-center-18.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-19.gif) Rw U Rw' U Rw U2 Rw'  
![](@assets/2015/02/5x5x5-basic-solution-center-20.gif)→![](@assets/2015/02/5x5x5-basic-solution-center-21.gif) Rw U M' U' Rw' U M

### エッジセット(リダクション・オオクサ式)

（動画での解説は[こちら](http://www.youtube.com/watch?v=UyijIaCNSuo)です、合わせてご覧ください）  
Uw,Uw',Uw2,Dw,Dw',Dw2を使って、ひとつずつエッジセットを行います。  
![](@assets/2015/02/5x5x5-basic-solution-edge-1.gif)→![](@assets/2015/02/5x5x5-basic-solution-edge-2.gif) Uw' Dw'  
その後揃えたエッジをU面かD面に逃がし、次のエッジセットを行う…を繰り返しましょう。  
![](@assets/2015/02/5x5x5-basic-solution-edge-3.gif)→![](@assets/2015/02/5x5x5-basic-solution-edge-4.gif)R U R'で 揃えたエッジをU面に逃がす  
8つのエッジセットが終了して、U面とD面のエッジが全てエッジセットが終了した状態になったら、ずれたセンターを直します。

その後、残った4つのエッジを、エッジ2点交換を何回か用いてエッジセットを行います。  
![](@assets/2015/02/5x5x5-basic-solution-edge-5.gif)→![](@assets/2015/02/5x5x5-basic-solution-edge-6.gif) Uw' R U R' F R' F' R Uw

![](@assets/2015/02/5x5x5-basic-solution-edge-7.gif)  
最後にこの状態になったら、  
Rw U2 Rw F2 Rw F2 Rt' F2 Rt U2 Rw' U2 Rw U2 Rw' U2 Rw'　(tは3層回しです)  
を行います。

### 5列を3列とみなして3x3x3

タイトルの通り、3x3x3の要領ですべての面を揃えます。  
これで完成です！お疲れ様 でした。  
![](@assets/2015/02/5x5x5-basic-solution-3x3x3-1.gif)

(執筆者：[Morooka](../../../author#morooka)・[HATAMURA](../../../author#hatamura))

[このページの最上部に戻る](#)  
[5x5x5トップに戻る](../)
