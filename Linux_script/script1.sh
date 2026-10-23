#!/usr/bin/bash
tree
echo "設問1 project/docs/draft というディレクトリ構造を作成してください"
echo -n INPUT_STR:
##入力を受付、その入力を「str」に代入
read str
if [ "$str" = "mkdir -p project/docs/draft" ]; then
echo "あなたの入力は $str です"
echo -e "\e[32m正解です！\e[0m"
$str
else
echo "あなたの入力は $str です"
echo -e "\e[31m間違っています\e[0m"
mkdir -p project/docs/draft
fi
echo "ツリー表示"
tree
