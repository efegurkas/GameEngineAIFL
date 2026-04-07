"""
Gomoku Bot Şablonu
==================
Bu dosyayı düzenleyerek kendi botunuzu yazın.

Protokol:
- Her tur: stdin'den bir JSON satırı gelir
- Stdout'a { "x": int, "y": int } yazmalısınız
- Yanıt 5 saniyeyi geçmemelidir

Gelen JSON formatı:
{
  "board": [[0,1,2,...], ...],  # 15x15 matris. 0=boş, 1=siyah, 2=beyaz
  "turn": 1,                    # şu anki oyuncu (1=siyah, 2=beyaz)
  "role": 1,                    # sizin rolünüz (maç boyunca sabit)
  "matchId": "match_...",
  "timeLimit": 5,               # saniye
  "moveCount": 12
}
"""

import sys
import json
import random

SIZE = 15


def get_empty_cells(board):
    return [(x, y) for y in range(SIZE) for x in range(SIZE) if board[y][x] == 0]


def find_best_move(board, role):
    """
    Basit bir strateji:
    1. Kazanan hamle varsa yap
    2. Rakibi engelle
    3. Merkeze yakın rastgele hamle yap
    """
    opponent = 2 if role == 1 else 1

    for player in [role, opponent]:
        for y in range(SIZE):
            for x in range(SIZE):
                if board[y][x] == 0:
                    if would_win(board, x, y, player):
                        return x, y

    # Merkeze yakın hücreler tercih et
    center = SIZE // 2
    candidates = get_empty_cells(board)
    if not candidates:
        return 0, 0

    candidates.sort(key=lambda c: abs(c[0] - center) + abs(c[1] - center))
    top = candidates[:max(1, len(candidates) // 3)]
    x, y = random.choice(top)
    return x, y


def would_win(board, x, y, player):
    """Verilen pozisyona taş koyulunca kazanır mı?"""
    directions = [(1, 0), (0, 1), (1, 1), (1, -1)]
    board[y][x] = player
    win = False
    for dx, dy in directions:
        cnt = 1 + count_dir(board, x, y, dx, dy, player) + count_dir(board, x, y, -dx, -dy, player)
        if cnt >= 5:
            win = True
            break
    board[y][x] = 0
    return win


def count_dir(board, x, y, dx, dy, player):
    cnt = 0
    cx, cy = x + dx, y + dy
    while 0 <= cx < SIZE and 0 <= cy < SIZE and board[cy][cx] == player:
        cnt += 1
        cx += dx
        cy += dy
    return cnt


def main():
    # stderr'e log yazabilirsiniz (sunucu konsola basar)
    print(f"Bot başlatıldı, rol bekleniyor...", file=sys.stderr)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            state = json.loads(line)
        except json.JSONDecodeError as e:
            print(f"JSON parse hatası: {e}", file=sys.stderr)
            continue

        board = state["board"]
        role  = state["role"]

        try:
            x, y = find_best_move(board, role)
        except Exception as e:
            print(f"Hamle hesaplama hatası: {e}", file=sys.stderr)
            # Rastgele bir hücreye düş
            empty = [(cx, cy) for cy in range(SIZE) for cx in range(SIZE) if board[cy][cx] == 0]
            if empty:
                x, y = random.choice(empty)
            else:
                x, y = 0, 0

        # Cevabı stdout'a yaz (tek satır JSON)
        print(json.dumps({"x": x, "y": y}), flush=True)


if __name__ == "__main__":
    main()