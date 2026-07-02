import sympy

o_x, o_y, o_z = sympy.var("o_x o_y o_z")
d_x, d_y, d_z = sympy.var("d_x d_y d_z")
a, b, c, d, w = sympy.var("a b c d w")
t = sympy.var("t")

x = o_x + d_x * t
y = o_y + d_y * t
z = o_z + d_z * t

F = (a * x + b * y + c * z + d * w) ** 2 + (b * x - a * y + d * z - c * w) ** 2 - 1
F_polynomial = F.as_poly(t)
coeffs = F_polynomial.coeffs()
A, B, C = coeffs[2], coeffs[1], coeffs[0]

print("A =", sympy.latex(A))
print("B =", sympy.latex(B))
print("C =", sympy.latex(C))

x, y, z = sympy.var("x y z")
F = (a * x + b * y + c * z + d * w) ** 2 + (b * x - a * y + d * z - c * w) ** 2 - 1
print("A", sympy.latex(F.diff(x)))
print("B", sympy.latex(F.diff(y)))
print("C", sympy.latex(F.diff(z)))