<?php
// アップロードされたファイルの情報を取得
$upload_file_info = $_FILES['file'];

// 保存先ファイルパス
$save_file_path = 'upload/'.$upload_file_info['name'];

// 保存
if (move_uploaded_file($upload_file_info['tmp_name'], $save_file_path)) {
        echo 'アップロードに成功しました。';
} else {
        echo 'アップロードに失敗しました。';
}
?>