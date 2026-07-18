<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db     = get_db();

function decode_blog(array $row): array {
    if (isset($row['tags']) && is_string($row['tags'])) {
        $row['tags'] = json_decode($row['tags'], true) ?? [];
    }
    return $row;
}

// ─── GET (public for published, all for auth) ─────────────
if ($method === 'GET') {
    $authed = false;
    try {
        require_auth();
        $authed = true;
    } catch (\Throwable $e) {}

    if ($id) {
        $stmt = $db->prepare('SELECT * FROM blogs WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Blog not found', 404);
        json_success(decode_blog($row));
    }

    $page   = (int) ($_GET['page']     ?? 1);
    $per    = (int) ($_GET['per_page'] ?? 20);
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';

    $conds = [];
    $vals  = [];

    if (!$authed) {
        $conds[] = "status = 'published'";
    } elseif ($status !== '' && $status !== 'all') {
        $conds[] = 'status = ?';
        $vals[]  = $status;
    }
    if ($search !== '') {
        $conds[] = '(title LIKE ? OR author LIKE ?)';
        $vals    = array_merge($vals, ["%$search%", "%$search%"]);
    }

    $where  = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';
    $offset = ($page - 1) * $per;

    $count = $db->prepare("SELECT COUNT(*) FROM blogs $where");
    $count->execute($vals);
    $total = (int) $count->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM blogs $where ORDER BY created_at DESC LIMIT $per OFFSET $offset");
    $stmt->execute($vals);
    $rows = array_map('decode_blog', $stmt->fetchAll());

    json_success(['items' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $per, 'total_pages' => (int)ceil($total/$per)]);
}

// Write ops require auth
require_auth();
$body = get_body();

// ─── POST (create) ────────────────────────────────────────
if ($method === 'POST') {
    if (empty($body['title']) || empty($body['slug'])) {
        json_error('Title and slug are required');
    }

    $chk = $db->prepare('SELECT id FROM blogs WHERE slug = ?');
    $chk->execute([$body['slug']]);
    if ($chk->fetch()) json_error('Slug already exists');

    $publishedAt = ($body['status'] === 'published' && empty($body['published_at']))
        ? date('Y-m-d H:i:s')
        : ($body['published_at'] ?? null);

    $stmt = $db->prepare('
        INSERT INTO blogs
          (title,slug,excerpt,content,cover_image,author,tags,status,meta_title,meta_description,published_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ');
    $stmt->execute([
        $body['title'],
        $body['slug'],
        $body['excerpt']          ?? '',
        $body['content']          ?? '',
        $body['cover_image']      ?? null,
        $body['author']           ?? 'Admin',
        json_encode($body['tags'] ?? []),
        $body['status']           ?? 'draft',
        $body['meta_title']       ?? null,
        $body['meta_description'] ?? null,
        $publishedAt,
    ]);

    $newId = (int) $db->lastInsertId();
    $stmt  = $db->prepare('SELECT * FROM blogs WHERE id = ?');
    $stmt->execute([$newId]);
    json_success(decode_blog($stmt->fetch()), 201);
}

// ─── PUT (update) ─────────────────────────────────────────
if ($method === 'PUT' && $id) {
    if (!empty($body['slug'])) {
        $chk = $db->prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?');
        $chk->execute([$body['slug'], $id]);
        if ($chk->fetch()) json_error('Slug already exists');
    }

    $fields = [];
    $vals   = [];
    $allowed = ['title','slug','excerpt','content','cover_image','author','status','meta_title','meta_description','published_at'];

    foreach ($allowed as $f) {
        if (array_key_exists($f, $body)) {
            $fields[] = "`$f` = ?";
            $vals[]   = $body[$f];
        }
    }
    if (array_key_exists('tags', $body)) {
        $fields[] = '`tags` = ?';
        $vals[]   = json_encode($body['tags']);
    }
    // Auto-set published_at when status changes to published
    if (($body['status'] ?? '') === 'published') {
        $chk = $db->prepare('SELECT published_at FROM blogs WHERE id = ?');
        $chk->execute([$id]);
        $existing = $chk->fetch();
        if (!$existing['published_at']) {
            $fields[] = '`published_at` = ?';
            $vals[]   = date('Y-m-d H:i:s');
        }
    }

    if (!$fields) json_error('Nothing to update');
    $vals[] = $id;
    $db->prepare('UPDATE blogs SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);

    $stmt = $db->prepare('SELECT * FROM blogs WHERE id = ?');
    $stmt->execute([$id]);
    json_success(decode_blog($stmt->fetch()));
}

// ─── DELETE ───────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    $db->prepare('DELETE FROM blogs WHERE id = ?')->execute([$id]);
    json_success(['deleted' => true]);
}

json_error('Method not allowed', 405);
