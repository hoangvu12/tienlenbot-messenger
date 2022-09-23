module.exports = {
  execute(_, handlers) {
    const message = `Lệnh:
taophong {id} - Tạo trận đấu với một id, id này dùng để mời người chơi khác'

thamgia {id}   - Tham gia trận đấu với id có sẵn

thoatphong   - Thoát khỏi trận đấu. (Yêu cầu người chơi đã vào một trận đấu)

batdau   - Bắt đầu trận đấu. (Yêu cầu ít nhất 2 người chơi)

danh {sothutu} - Đánh bài với số thứ tự của thẻ (Yêu cầu đã đến lượt đánh) VD: !danh 1 2 3

boluot    - Bỏ qua lượt đánh.

`;
    handlers.reply(message);
  },
};
