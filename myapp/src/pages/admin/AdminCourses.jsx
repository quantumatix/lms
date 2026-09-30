import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Plus, Edit, Trash2, Globe, CheckCircle, Archive } from "lucide-react";

const sectionStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "28px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid rgba(0,0,0,0.04)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: "10px",
  fontSize: "13px",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const EMPTY_FORM = {
  name: "",
  technology: "",
  category: "Programming",
  level: "Beginner",
  status: "published",
  description: "",
  target_audience: "",
};

function AdminCourses() {
  const { toasts, addToast, removeToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/admin/courses")
      .then(r => r.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        addToast("Failed to load courses", "error");
        setLoading(false);
      });
  };

  useEffect(() => { fetchCourses(); }, []);

  const openCreate = () => {
    setEditCourse(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditCourse(course);
    setForm({
      name: course.name || "",
      technology: course.technology || "",
      category: course.category || "Programming",
      level: course.level || "Beginner",
      status: course.status || "published",
      description: course.description || "",
      target_audience: course.target_audience || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.technology.trim()) {
      addToast("Name and Technology are required", "error");
      return;
    }
    setSaving(true);
    try {
      const url = editCourse
        ? `http://127.0.0.1:8000/admin/courses/${editCourse.id}`
        : "http://127.0.0.1:8000/admin/courses";
      const method = editCourse ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(editCourse ? "Course updated" : "Course created", "success");
      setShowModal(false);
      fetchCourses();
      window.dispatchEvent(new Event("courses-updated"));
    } catch (err) {
      addToast("Error saving course: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (course, newStatus) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(`Course ${newStatus}`, "success");
      fetchCourses();
      window.dispatchEvent(new Event("courses-updated"));
    } catch (err) {
      addToast("Error: " + err.message, "error");
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/courses/${course.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      addToast("Course deleted", "success");
      fetchCourses();
      window.dispatchEvent(new Event("courses-updated"));
    } catch (err) {
      addToast("Error: " + err.message, "error");
    }
  };

  const statusBadge = (status) => {
    const map = {
      published: { color: "#16a34a", bg: "#f0fdf4", label: "Published" },
      draft: { color: "#d97706", bg: "#fffbeb", label: "Draft" },
      archived: { color: "#64748b", bg: "#f1f5f9", label: "Archived" },
    };
    const s = map[status] || map.draft;
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: "2px 10px", borderRadius: "20px",
        fontSize: "11px", fontWeight: 600
      }}>{s.label}</span>
    );
  };

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#0f172a" }}>Course Management</h4>
            <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
              Create and manage courses. Each course has its own content and AI generation.
            </p>
          </div>
          <button className="btn btn-primary rounded-3 d-flex align-items-center gap-2" onClick={openCreate}>
            <Plus size={16} />
            New Course
          </button>
        </div>

        {/* Table */}
        <div style={sectionStyle}>
          {loading ? (
            <div className="text-center py-5 text-muted">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-5 text-muted">No courses yet. Create your first course.</div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.4px" }}>
                  <th>Course</th>
                  <th>Technology</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div className="fw-semibold" style={{ fontSize: "13px" }}>{course.name}</div>
                      <div className="text-muted" style={{ fontSize: "11px" }}>{course.id}</div>
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: "12px" }}>
                        {course.technology}
                      </span>
                    </td>
                    <td><span style={{ fontSize: "13px" }}>{course.level}</span></td>
                    <td>{statusBadge(course.status)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-2"
                          title="Edit"
                          onClick={() => openEdit(course)}
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                        >
                          <Edit size={13} />
                        </button>
                        {course.status !== "published" && (
                          <button
                            className="btn btn-sm btn-outline-success rounded-2"
                            title="Publish"
                            onClick={() => handleStatusChange(course, "published")}
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                        {course.status === "published" && (
                          <button
                            className="btn btn-sm btn-outline-warning rounded-2"
                            title="Archive"
                            onClick={() => handleStatusChange(course, "archived")}
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                          >
                            <Archive size={13} />
                          </button>
                        )}
                        {course.id !== "python-core" && (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-2"
                            title="Delete"
                            onClick={() => handleDelete(course)}
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "540px" }}>
            <div className="modal-content rounded-4 border-0" style={{ padding: "32px" }}>
              <h5 className="fw-bold mb-4" style={{ color: "#0f172a" }}>
                {editCourse ? "Edit Course" : "Create New Course"}
              </h5>
              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-12">
                    <label style={labelStyle}>Course Name *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Java Programming, JavaScript, SQL Basics"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Technology *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Java, JavaScript, SQL, Python"
                      value={form.technology}
                      onChange={e => setForm(f => ({ ...f, technology: e.target.value }))}
                      required
                    />
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      This is passed to AI for content generation
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Level</label>
                    <select
                      style={inputStyle}
                      value={form.level}
                      onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    >
                      {["Beginner", "Intermediate", "Advanced"].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Category</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Programming, Database, DevOps"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Status</label>
                    <select
                      style={inputStyle}
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    >
                      <option value="published">Published (Visible in Student Panel)</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Target Audience</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Beginners, Backend developers"
                      value={form.target_audience}
                      onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Description</label>
                    <textarea
                      style={{ ...inputStyle, height: "80px", resize: "vertical" }}
                      placeholder="Brief description of what this course covers..."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="d-flex gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-3 flex-fill"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 flex-fill"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : (editCourse ? "Update Course" : "Create Course")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCourses;
