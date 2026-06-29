---
title: "コーラ式(32223メソッド)解法解説"
date: "2015-03-09"
order: 0
---
ここでは「エッジペアリング解法」のひとつである「コーラ式」について解説します。

### 解法の流れ

<iframe width="560" height="315" src="https://www.youtube.com/embed/bio823dKqyI" frameborder="0" allowfullscreen=""></iframe>

動画のように、まず3つのエッジから先に揃え、次に2つずつエッジを揃えていきます。  
初めに3つのエッジを揃え、BRとBLのエッジを既にペアリング済みのエッジで埋めてしまえば、普段隠れて見づらいBRとBLを見ないで済むため、タイムの短縮に繋がる…というのがコーラ式の発想です。

D面のエッジを全てクロス色エッジで埋めてしまうことでさらにエッジペアリング短縮・3x3x3パートでクロスを作る手間をも省くという発想の元開発されたのが、発展的な解法である  
Yau法とHoya法です。コーラ式をマスターしたらぜひ挑戦してみてください。

### 例外パターン

一連の流れでは解決出来ない例外パターンも存在します。  
ここではその解決方法の一例を紹介します。

2点交換に似た状態になってしまう  
<iframe width="560" height="315" src="https://www.youtube.com/embed/SebdkjeL4aU" frameborder="0" allowfullscreen=""></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/quxWi0ViyZU" frameborder="0" allowfullscreen=""></iframe>

ループが途切れる  
<iframe width="560" height="315" src="https://www.youtube.com/embed/ZkRTSb0GEow" frameborder="0" allowfullscreen=""></iframe>

（執筆者：[Morooka](../../../author#morooka)）

[このページの最上部に戻る](#)  
[前のページに戻る](../)
