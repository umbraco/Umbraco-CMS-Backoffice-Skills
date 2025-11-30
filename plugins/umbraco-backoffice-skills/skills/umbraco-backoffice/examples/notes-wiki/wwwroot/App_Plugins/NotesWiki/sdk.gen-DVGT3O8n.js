import { c as t } from "./client.gen-m1c42xYY.js";
class a {
  static createFolder(e) {
    return ((e == null ? void 0 : e.client) ?? t).post({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/folders",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e == null ? void 0 : e.headers
      }
    });
  }
  static deleteFolder(e) {
    return (e.client ?? t).delete({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/folders/{id}",
      ...e
    });
  }
  static getFolder(e) {
    return (e.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/folders/{id}",
      ...e
    });
  }
  static updateFolder(e) {
    return (e.client ?? t).put({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/folders/{id}",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e == null ? void 0 : e.headers
      }
    });
  }
  static createNote(e) {
    return ((e == null ? void 0 : e.client) ?? t).post({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/notes",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e == null ? void 0 : e.headers
      }
    });
  }
  static deleteNote(e) {
    return (e.client ?? t).delete({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/notes/{id}",
      ...e
    });
  }
  static getNote(e) {
    return (e.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/notes/{id}",
      ...e
    });
  }
  static updateNote(e) {
    return (e.client ?? t).put({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/notes/{id}",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e == null ? void 0 : e.headers
      }
    });
  }
  static getRecentNotes(e) {
    return ((e == null ? void 0 : e.client) ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/notes/recent",
      ...e
    });
  }
  static searchNotes(e) {
    return ((e == null ? void 0 : e.client) ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/notes/search",
      ...e
    });
  }
  static getAncestors(e) {
    return (e.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/tree/ancestors/{id}",
      ...e
    });
  }
  static getChildren(e) {
    return (e.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/tree/children/{parentId}",
      ...e
    });
  }
  static getRoot(e) {
    return ((e == null ? void 0 : e.client) ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/notes/api/v1/tree/root",
      ...e
    });
  }
}
export {
  a as N
};
//# sourceMappingURL=sdk.gen-DVGT3O8n.js.map
