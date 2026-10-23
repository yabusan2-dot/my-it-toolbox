#!/usr/bin/bash
tree
echo "設問3 作成した project/docs/draft ディレクトリ構造を全て削除してください"
#
PS3="オプションを選択をしてください: "
options=("-f" "-r" "-fと-r")
select choice in "${options[@]}"; do
case $choice in
"-f")
echo "間違いです、もう一度選択してください"
;;
"-r")
        echo "間違いです、もう一度選択してください"
        ;;
"-fと-r")
        echo "正解です"
        break
        ;;
*)
        echo "無効な選択です。もう一度入力してください。"
        ;;
        esac
done

rm -rf project
