# Portfolio Template

A config-driven, zero-build portfolio template for engineers.

---

## 操作流程 / Workflow

### 1. Clone

```bash
git clone <your-repo-url>
cd portfolio-template
```

### 2. Edit config.json

All personal data is centralized here. Edit section by section:

| Section | What to fill in |
|---------|----------------|
| `profile` | Name, titles, bio, social links |
| `skills` | Learning paths and skill items |
| `achievements` | Certifications, badges, education |
| `projects` | Project showcase |
| `blog` | Blog post entries |
| `goals` | Yearly goals |
| `timeline` | Chronological events |

### 3. Add media files

| Type | Path |
|------|------|
| Avatar | `assets/img/avatar.jpg` |
| Cert images | `certs/` |
| Badge images | `badges/` |
| Blog posts | `blog/YYYY-MM-DD-title.md` |

### 4. Preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`

### 5. Deploy

1. Push to GitHub
2. Settings → Pages → Source: `main` branch, root `/`

---

## Usage / 使用说明

### 编辑 config.json

修改 `config.json` 中的各字段即可更新对应内容：

- **profile**: 姓名、头衔、简介、社交链接
- **skills**: 学习路径和技能项目，`done: true` 表示已完成
- **achievements**: 证书（支持 credential 链接和有效期）、徽章、教育经历
- **projects**: 项目展示（名称、描述、标签、语言、Star 数）
- **blog**: 博客文章，支持 Markdown 和标签筛选
- **goals**: 年度目标及进度百分比
- **timeline**: 经历时间线，按类型分类筛选

### 添加博客文章

1. 在 `blog/` 目录创建 Markdown 文件
2. 在 `config.json` 的 `blog.posts` 中添加条目

### 添加证书/徽章

1. 图片放入 `certs/` 或 `badges/`
2. 在 `config.json` 的 `achievements` 中添加对应条目
3. 可选：在 `timeline` 中添加事件

### 更新技能进度

将对应技能项的 `"done": false` 改为 `"done": true`

---

## Tech Stack

Pure HTML + CSS + JavaScript — no frameworks, no build step, no dependencies.
