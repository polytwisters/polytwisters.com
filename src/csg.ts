/*
A structure for CSG (Constructive Solid Geometry) operations on pipes. It is a tree data
structure where the leaves are pipes, which are nested in Boolean operations. This data structure
is used to generate an expression in GLSL which computes the given Boolean operations.
*/

export interface Intersection {
  logs: number[];
  antiLogs?: number[];
}

export interface Union {
  operands: Intersection[];
}

export type CSG = Union;

function codeGenLog(index: number): string {
  return `p[${index}]`;
}

function csgCodeGenIntersection(node: Intersection): string {
  const parts: string[] = [];
  if (node.logs.length === 0) {
    return "false";
  }
  for (let log of node.logs) {
    parts.push(codeGenLog(log));
  }
  if (node.antiLogs) {
    for (let antiLog of node.antiLogs) {
      parts.push("!" + codeGenLog(antiLog));
    }
  }
  return "(" + parts.join(" && ") + ")";
}

export function csgCodeGen(node: Union): string {
  const parts: string[] = [];
  if (node.operands.length === 0) {
    return "true";
  }
  for (let operand of node.operands) {
    parts.push(csgCodeGenIntersection(operand));
  }
  return parts.join(" || ");
}

export function convex(n: number): Union {
  const tmp: number[] = [];
  for (let i = 0; i < n; i++) {
    tmp.push(i);
  }
  return {
    operands: [{ logs: tmp }],
  };
}

function parseIntersection(code: string): number[] {
  return code.split("*").map((x) => parseInt(x, 10));
}

export function parse(code: string): Union {
  const unionParts = code.split("+");
  const operands: Intersection[] = [];
  for (let part of unionParts) {
    const tmp = part.split("/", 1);
    const logs = parseIntersection(tmp[0]);
    const antiLogs = tmp[1] ? parseIntersection(tmp[1]) : [];
    operands.push({ logs, antiLogs });
  }
  return { operands };
}
