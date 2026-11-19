# Bé chơi nào — trang trò chơi chạm cho bé 1–3 tuổi

Chạy trên trình duyệt điện thoại và iPad, không cần cài ứng dụng, không quảng cáo, không thu thập dữ liệu. Âm thanh tự tạo bằng WebAudio, hình dùng emoji và SVG nên không có tệp ảnh hay tiếng nào cần tải.

## Cách chạy

**Thử nhanh trên máy tính:** mở `index.html` bằng Chrome. (Giọng nói và chế độ ngoại tuyến cần địa chỉ `http`, nên nên dùng cách dưới.)

**Mở trên điện thoại/iPad cùng mạng Wi-Fi:**

```bash
cd E:\Claude\be-choi
python -m http.server 8080
```

Rồi mở `http://<địa chỉ IP máy tính>:8080` trên điện thoại.

**Đưa lên mạng để mở ở đâu cũng được:** kéo thả cả thư mục này vào Netlify Drop, hoặc đẩy lên GitHub Pages / Cloudflare Pages. Đều miễn phí, trang là web tĩnh.

**Cài như ứng dụng:** iPhone/iPad bấm Chia sẻ → "Thêm vào Màn hình chính". Android bấm menu → "Cài đặt ứng dụng". Sau lần mở đầu có mạng, trang chạy được cả khi không có mạng.

**Khu phụ huynh:** giữ nút ⚙️ ở góc phải màn hình chính 2 giây. Ở đó chỉnh âm lượng, bật/tắt giọng, tiếng Việt/English, tuổi của bé (lọc trò phù hợp), hẹn giờ chơi.

## Chín trò chơi và lý do chọn

| Trò | Từ tháng | Bé làm gì | Dựa trên |
|---|---|---|---|
| 🎈 Bong bóng | 12 | Chạm cho bóng nổ, chạm chỗ trống để thổi bóng mới | Nhân quả tức thì: chạm → có tiếng, có hình. Chỉ cần thao tác chạm. |
| 🙈 Ú òa | 12 | Chạm tấm vải để mở ra con vật | Vật vẫn còn khi bị che (khoảng 18–24 tháng hiểu rõ) nên bé rất thích giấu và tìm. |
| 🐮 Con vật kêu | 12 | Chạm con vật nghe tên và tiếng kêu | Bé hiểu nhiều hơn nói. Lặp lại tên + tiếng kêu giúp học từ. |
| 🎹 Đàn | 12 | Chạm hoặc lướt trên các thanh màu | Thang âm ngũ cung, chạm bừa vẫn nghe hài hòa. Nút ▶ cho người lớn làm mẫu. |
| 🎨 Vẽ | 15 | Vẽ cầu vồng hoặc đóng dấu bằng ngón tay | Nguệch ngoạc xuất hiện khoảng 15–18 tháng. Nét lớn, không cần vẽ "đúng". |
| 🔔 Nút bấm | 18 | Bật đèn, rung chuông, gõ trống, xe chạy, tên lửa đếm 3-2-1, ngày/đêm | Bé mê công tắc, nút bấm. Mỗi nút một kết quả khác nhau. |
| 🐻 Cho gấu ăn | 24 | Kéo đồ ăn vào miệng gấu, hoặc chạm để đồ ăn tự bay tới | Kéo thả đơn giản, gắn với giả vờ và chăm sóc. |
| 🧩 Xếp hình | 24 | Kéo hình vào đúng ô (tròn, vuông, tam giác, sao, tim) | Xếp hình khối bắt đầu từ ô tròn, đến 24 tháng phân biệt được hình phức tạp hơn. |
| 🔍 Tìm đồ | 30 | Nghe "Đâu là quả táo?" rồi chọn 1 trong 3; thỉnh thoảng tìm màu | Hiểu lời nói về tên vật và màu. Sai hai lần thì ô đúng nhấp nháy gợi ý. |

## Nguyên tắc thiết kế rút ra từ nghiên cứu

1. **Nút to, thao tác đơn giản.** Nielsen Norman Group khuyên ô chạm cho trẻ nhỏ tối thiểu 2 × 2 cm (gấp 4 lần người lớn). Trang này dùng ô khoảng 3–6 cm. Các nghiên cứu cho thấy bé 2 tuổi làm tốt chạm và kéo, còn chụm ngón, xoay, nhấn giữ thì khó. Vì vậy chỉ dùng chạm và kéo.
2. **Kéo thả luôn có đường lui.** Với trẻ dưới 5 tuổi, một số nhà nghiên cứu khuyên cho phép "chạm vật, vật tự bay tới đích". Trò Cho gấu ăn và Xếp hình đều làm vậy.
3. **Nhiều ngón cùng lúc đều được.** Bé hay chạm bằng nhiều ngón hoặc cả bàn tay. Mọi trò xử lý từng ngón riêng, không bị rối.
4. **Không thua, không điểm, không đồng hồ.** Chọn sai chỉ lắc nhẹ, không có tiếng báo lỗi. Nhịp chậm, không ép.
5. **Mọi lần chạm đều có phản hồi** bằng âm thanh và hình, vì bé 1 tuổi đang học "mình làm gì thì có gì xảy ra".
6. **Không chữ bắt buộc.** Chữ nhỏ chỉ để người lớn đọc cùng. Lời nói do trình duyệt đọc.
7. **Giới hạn thời gian.** WHO khuyên không dùng màn hình dưới 1 tuổi và không quá 1 giờ mỗi ngày cho trẻ 2–4 tuổi. Hội Nhi khoa Hoa Kỳ khuyên chọn ứng dụng chậm, mở, và chơi cùng bé. Trang có hẹn giờ mặc định 10 phút, hết giờ hiện màn hình "hẹn gặp lại", chỉ phụ huynh (giữ nút 2 giây) mới chơi tiếp được.
8. **Không có đường ra ngoài.** Không liên kết, không quảng cáo, không mua hàng.

### Nguồn đã đọc

- [Nielsen Norman Group — Children's UX: physical development](https://www.nngroup.com/articles/children-ux-physical-development/) (kích thước ô chạm, thao tác phù hợp lứa tuổi)
- [Nacher và cộng sự — Multi-touch gestures for pre-kindergarten children](https://riunet.upv.es/bitstream/handle/10251/64752/IJHCS-Nacher.pdf?sequence=2) (bé 2–3 tuổi và các thao tác cảm ứng)
- [Albrecht và cộng sự, CHI PLAY 2018 — Toddler Techie Touch Generation](https://unpaywall.org/10.1145%2F3242671.3242693) (bé 18–42 tháng: kéo khó hơn chạm, chụm/xoay khó nhất)
- [UXPA — Playful Interfaces](https://oldmagazine.uxpa.org/?p=11776) (gợi ý "chạm rồi chạm" thay vì kéo thả cho trẻ dưới 5)
- [Zero to Three — Milestones by Age](https://www.zerotothree.org/wp-content/uploads/2026/08/Milestones-by-Age-Chart.pdf), [Britannica — Infant and toddler development](https://www.britannica.com/science/infant-and-toddler-development/Introduction) (mốc phát triển)
- [Pathways.org — Screen time](https://pathways.org/screen-time-for-babies-and-children) (tổng hợp khuyến nghị về thời gian màn hình)

**Lưu ý trung thực về nguồn:** nhiều nghiên cứu về cảm ứng có mẫu nhỏ và độ tuổi pha trộn nên số liệu chỉ nên coi là gợi ý. Khuyến nghị thời gian màn hình mình mới đọc qua các trang tổng hợp, chưa đọc bản gốc của WHO và AAP (AAP đã đổi cách tiếp cận trong 2025–2026, chú trọng nội dung và việc chơi cùng bé hơn là con số cứng). Các mốc tháng tuổi ở bảng trên là khoảng tham khảo, mỗi bé một khác.

## Giới hạn hiện tại

- **Chưa thử trên máy thật.** Mình đã chạy thử bằng Chrome giả lập màn hình cảm ứng ở ba cỡ (điện thoại dọc, điện thoại ngang, iPad): chạm, kéo, giữ mở khu phụ huynh đều chạy, không có lỗi. Nhưng tiếng và giọng nói chưa nghe được trong lần thử này.
- **Giọng nói phụ thuộc máy.** Trang dùng giọng đọc có sẵn của iPhone/iPad/Android. Nếu máy chưa cài giọng tiếng Việt thì lời đọc có thể im hoặc đọc bằng giọng khác (cách cài ghi trong khu phụ huynh). Âm thanh và hình vẫn chạy bình thường.
- **iPhone/iPad:** gạt công tắc chuông sang bật thì mới nghe tiếng.
- **Hình emoji** trông hơi khác nhau giữa iOS, Android và Windows.
- **Tiếng kêu con vật** hiện do giọng đọc nói "meo meo", "gâu gâu". Nếu muốn tiếng thật, có thể thêm tệp thu âm sau.

## Cấu trúc tệp

- `index.html`, `style.css` — giao diện
- `core.js` — cài đặt, âm thanh, giọng nói, hiệu ứng, tiện ích kéo thả
- `games-a.js` — bong bóng, ú òa, con vật kêu, đàn (và dữ liệu con vật, đồ ăn, đồ vật, màu)
- `games-b.js` — vẽ, nút bấm, cho gấu ăn, xếp hình, tìm đồ
- `shell.js` — menu, khu phụ huynh, hẹn giờ
- `sw.js`, `manifest.webmanifest`, `icon*` — chạy ngoại tuyến và cài như ứng dụng

**Thêm một trò mới:** thêm một khối `BE.GAMES.push({ id, icon, color, bg, min, name, start(api) { ... } })` vào `games-a.js` hoặc `games-b.js`. `api` có sẵn `say`, `on`, `timeout`, `loop` (tự dọn khi thoát trò).
