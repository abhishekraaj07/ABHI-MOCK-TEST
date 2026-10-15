# scripts/bca_data_numerical.py
# 100 High-Yield Questions for Numerical Methods (BCA-504) from CCSU Syllabus & Solved PYQs

def get_numerical_questions():
    raw = [
        # 1. Floating Point, Errors & Approximations (1-10)
        ("If X is the true value and X' is the approximate value, what is the mathematical formula for Absolute Error (E_a)?",
         "|X - X'|", "|X - X'| / X", "|X - X'| * 100", "(X - X')^2",
         "A", "Absolute Error is the absolute magnitude of difference between true and approximate values: E_a = |X - X'|."),

        ("What is the definition of Relative Error (E_r)?",
         "Absolute Error divided by True Value (|X - X'| / |X|)", "True Value divided by Absolute Error", "Absolute Error multiplied by 100", "Square root of Absolute Error",
         "A", "Relative Error normalizes absolute error by the true value: E_r = |X - X'| / |X|."),

        ("How is Percentage Error (E_p) computed from Relative Error (E_r)?",
         "E_p = E_r / 100", "E_p = E_r * 100", "E_p = E_r^2", "E_p = sqrt(E_r)",
         "B", "Percentage Error is the relative error expressed as a percentage: E_p = E_r * 100%."),

        ("Rounding off the number 3.14159265 to four decimal places yields:",
         "3.1415", "3.1416", "3.1420", "3.1410",
         "B", "The 5th decimal digit is 9 (>= 5), so the 4th digit 5 is incremented by 1 giving 3.1416."),

        ("Truncation error in numerical computation is introduced primarily by:",
         "Hardware bit flips", "Replacing an infinite mathematical series with a finite number of terms", "Human typing errors", "Using float instead of double",
         "B", "Truncation error arises when infinite processes (e.g. Taylor series) are truncated to finite steps."),

        ("How many significant digits are present in the measurement 0.005040?",
         "6", "4 (5, 0, 4, 0)", "3", "7",
         "B", "Leading zeros are not significant; trailing zeros after a decimal point are significant: '5040' has 4 significant digits."),

        ("If an approximate number is correct to 'n' decimal places, the maximum absolute error does not exceed:",
         "0.5 * 10^(-n)", "10^(-n)", "0.5 * 10^(n)", "10^(n - 1)",
         "A", "When rounded to n decimal places, the absolute error is bounded by half a unit in the last place: <= 0.5 * 10^(-n)."),

        ("What is the absolute error when 2/3 is approximated as 0.667?",
         "0.000333...", "0.00033333... (|0.666667 - 0.667| = 0.000333...)", "0.001", "0.0005",
         "B", "True value = 0.6666667..., Approx = 0.667. Absolute error = |0.6666667 - 0.667| approx 0.000333."),

        ("Which error is inherently present before any computation begins, due to physical measurement limitations?",
         "Truncation Error", "Inherent / Empirical Error", "Round-off Error", "Algorithm Error",
         "B", "Inherent errors arise from measurement uncertainties, experimental tolerances, or simplified initial modeling."),

        ("Propagation of error in addition: if X = A + B, the maximum absolute error in X is bounded by:",
         "Delta A * Delta B", "Delta A + Delta B", "Delta A / Delta B", "|Delta A - Delta B|",
         "B", "In addition and subtraction, absolute errors add directly: Delta X <= Delta A + Delta B."),

        # 2. Algebraic & Transcendental Equations (11-25)
        ("The Bisection method for finding roots of f(x) = 0 is based on which fundamental calculus theorem?",
         "Mean Value Theorem", "Intermediate Value Theorem", "Rolle's Theorem", "Taylor's Theorem",
         "B", "If f(x) is continuous on [a, b] and f(a)*f(b) < 0, Intermediate Value Theorem guarantees at least one root in (a, b)."),

        ("What is the rate / order of convergence of the Bisection Method?",
         "Linear (Order 1 with factor 0.5)", "Quadratic (Order 2)", "Superlinear (1.618)", "Cubic (Order 3)",
         "A", "The interval of uncertainty is halved at each step, giving linear convergence with rate 1/2."),

        ("How many iterations of Bisection method are required to achieve an error tolerance epsilon for initial interval [a, b]?",
         "n >= log2((b - a) / epsilon)", "n >= (b - a) / epsilon", "n >= 2^(b - a)", "n >= log10(b - a)",
         "A", "Since error after n steps is (b - a)/2^n <= epsilon, taking base-2 logarithms yields n >= log2((b - a) / epsilon)."),

        ("In Regula Falsi (Method of False Position), the next approximation root 'c' is given by the formula:",
         "c = (a + b) / 2", "c = (a*f(b) - b*f(a)) / (f(b) - f(a))", "c = a - f(a)/f'(a)", "c = (f(a) + f(b)) / 2",
         "B", "Regula Falsi connects (a, f(a)) and (b, f(b)) with a secant chord, finding the x-intercept c = (a*f(b) - b*f(a))/(f(b) - f(a))."),

        ("What is the order of convergence of the Newton-Raphson Method?",
         "1 (Linear)", "2 (Quadratic)", "1.618", "3",
         "B", "Newton-Raphson exhibits quadratic convergence (order 2) near simple roots: error satisfies e_(n+1) approx C * e_n^2."),

        ("What is the recurrence relation for the Newton-Raphson iterative method?",
         "x_(n+1) = x_n - f(x_n) / f'(x_n)", "x_(n+1) = x_n - f'(x_n) / f(x_n)", "x_(n+1) = x_n + f(x_n)*f'(x_n)", "x_(n+1) = (x_n + x_(n-1)) / 2",
         "A", "Newton-Raphson linearizes f(x) using the tangent line: x_(n+1) = x_n - f(x_n)/f'(x_n)."),

        ("Under which specific condition does the Newton-Raphson method fail completely (division by zero)?",
         "When f(x_n) = 0", "When f'(x_n) = 0 (horizontal tangent)", "When f''(x_n) > 0", "When x_0 is negative",
         "B", "If the first derivative f'(x_n) is zero, the tangent line is horizontal and never intersects the x-axis."),

        ("What is the iterative formula to compute the square root of a positive number 'N' using Newton-Raphson?",
         "x_(n+1) = 0.5 * (x_n + N / x_n)", "x_(n+1) = x_n^2 - N", "x_(n+1) = 2 * (x_n - N)", "x_(n+1) = (x_n + N) / 2",
         "A", "For f(x) = x^2 - N = 0, f'(x) = 2x. Newton-Raphson yields x_(n+1) = x_n - (x_n^2 - N)/(2x_n) = 0.5*(x_n + N/x_n)."),

        ("What is the order of convergence of the Secant Method?",
         "1.000", "1.618 (The Golden Ratio)", "2.000", "3.000",
         "B", "The Secant method approximates the derivative with a finite difference chord, converging superlinearly at order (1 + sqrt(5))/2 approx 1.618."),

        ("How many function evaluations per iteration are required by the Secant Method once initialized?",
         "1 function evaluation", "2 function evaluations", "3 function evaluations", "0",
         "A", "The Secant method retains the previous f(x_(n-1)) and evaluates only f(x_n) at each step."),

        ("In Fixed-Point Iteration x = g(x), what is the sufficient condition for convergence in an interval containing root alpha?",
         "|g'(x)| > 1", "|g'(x)| < 1 for all x in the interval", "g'(x) = 0 everywhere", "g''(x) < 0",
         "B", "By the Banach Fixed-Point Theorem, |g'(x)| <= k < 1 guarantees unique contraction mapping and convergence."),

        ("Which root-finding method is guaranteed to always converge if an initial bracket [a, b] with f(a)*f(b) < 0 is given?",
         "Newton-Raphson", "Bisection Method", "Secant Method", "Fixed Point Iteration",
         "B", "Bisection is unconditionally guaranteed to bracket and converge to a root for continuous functions."),

        ("Newton-Raphson method applied to find the reciprocal of 'N' (1/N) yields the division-free iterative formula:",
         "x_(n+1) = x_n * (2 - N * x_n)", "x_(n+1) = x_n + N", "x_(n+1) = x_n / (2 - N)", "x_(n+1) = 2 * x_n - N",
         "A", "Solving f(x) = 1/x - N = 0 gives f'(x) = -1/x^2. x_(n+1) = x_n - (1/x_n - N)/(-1/x_n^2) = x_n*(2 - N*x_n)."),

        ("If an algebraic equation has a multiple root of multiplicity m > 1, how is Newton-Raphson modified to maintain quadratic convergence?",
         "x_(n+1) = x_n - f(x_n) / f'(x_n)", "x_(n+1) = x_n - m * (f(x_n) / f'(x_n))", "x_(n+1) = x_n - (1/m) * (f(x_n) / f'(x_n))", "x_(n+1) = m * x_n",
         "B", "Multiplying the correction term by multiplicity m restores quadratic convergence: x_(n+1) = x_n - m*(f(x_n)/f'(x_n))."),

        ("The iteration x_(n+1) = 0.5 * (x_n + 2/x_n) converges to:",
         "1", "sqrt(2) approx 1.4142", "2", "0.5",
         "B", "Setting x = 0.5*(x + 2/x) yields 2x = x + 2/x => x^2 = 2 => x = sqrt(2)."),

        # 3. Systems of Linear Equations: Direct & Iterative Methods (26-40)
        ("In Gauss Elimination method, the augmented matrix [A | B] is transformed into which form?",
         "Diagonal Matrix", "Upper Triangular Matrix", "Lower Triangular Matrix", "Scalar Matrix",
         "B", "Gauss elimination uses forward elimination to reduce the matrix to upper triangular form, solved by back substitution."),

        ("How does the Gauss-Jordan method differ from standard Gauss Elimination?",
         "It transforms the coefficient matrix directly into an Identity / Diagonal matrix, eliminating the need for back substitution", "It only works on 2x2 matrices", "It does not use row operations", "It is an iterative method",
         "A", "Gauss-Jordan eliminates both above and below the pivot, reducing [A | I] to [I | A^(-1)] or [A | B] to [I | X]."),

        ("What is the computational complexity (number of arithmetic operations) of Gauss Elimination for an n x n system?",
         "O(n)", "O(n^2)", "O(n^3) (approx 2/3 n^3 multiplications)", "O(n!)",
         "C", "Gauss elimination requires approximately 2n^3 / 3 floating point multiplications and additions."),

        ("Why is Partial Pivoting (row interchanges) employed during Gauss Elimination?",
         "To speed up execution", "To avoid division by zero and minimize round-off errors by choosing the largest available pivot element in magnitude", "To make the matrix symmetric", "To reduce memory storage",
         "B", "Partial pivoting places the largest element in column k on the diagonal, bounding multiplier magnitudes <= 1."),

        ("In LU Decomposition (Doolittle method), the coefficient matrix A is factored as A = L * U, where L has:",
         "Zeroes on the diagonal", "Ones on the main diagonal (Unit Lower Triangular)", "Arbitrary numbers on diagonal", "Negative values on diagonal",
         "B", "Doolittle's algorithm fixes diagonal entries l_ii = 1; Crout's algorithm fixes u_ii = 1."),

        ("Cholesky Decomposition A = L * L^T is applicable if and only if the matrix A is:",
         "Singular", "Symmetric and Positive Definite", "Upper Triangular", "Orthogonal",
         "B", "Cholesky factorization requires A to be strictly symmetric (A = A^T) and positive definite (x^T A x > 0 for all x != 0)."),

        ("What is the sufficient condition for convergence of iterative methods (Gauss-Jacobi and Gauss-Seidel)?",
         "The coefficient matrix must be Strictly Diagonally Dominant (|a_ii| > sum_{j != i} |a_ij|)", "Matrix determinant must be 1", "All elements must be positive", "Matrix must be skew-symmetric",
         "A", "Strict diagonal dominance guarantees that the spectral radius of the iteration matrix is strictly less than 1."),

        ("How does the Gauss-Seidel method differ fundamentally from the Gauss-Jacobi method?",
         "Gauss-Seidel uses the newly computed values of unknowns immediately within the same iteration cycle", "Gauss-Seidel only updates at the very end of all equations", "Gauss-Seidel is slower than Jacobi", "Gauss-Seidel requires no initial guess",
         "A", "Gauss-Seidel immediately incorporates updated x_i values in subsequent equations, converging roughly twice as fast as Jacobi."),

        ("A system of linear equations is called 'Ill-Conditioned' when:",
         "Determinant is 0", "A tiny change in coefficients or constants causes a drastic, disproportionate change in the solution vector", "It has more equations than unknowns", "All coefficients are integers",
         "B", "Ill-conditioned systems have very large condition numbers (||A|| * ||A^(-1)|| >> 1), causing extreme sensitivity to rounding."),

        ("The Condition Number of a matrix A is defined as:",
         "det(A)", "||A|| * ||A^(-1)||", "trace(A)", "rank(A)",
         "B", "Condition number kappa(A) = ||A|| * ||A^(-1)|| measures sensitivity; kappa(A) = 1 is ideal."),

        ("In the Gauss-Seidel method for 3 equations, how many iterations does it typically take relative to Gauss-Jacobi?",
         "Twice as many iterations", "Approximately half as many iterations (converges twice as fast)", "Exactly the same", "Ten times as many",
         "B", "Gauss-Seidel generally converges about twice as fast because spectral radius of Seidel iteration matrix is approx (spectral radius of Jacobi)^2."),

        ("What happens to an iterative linear solver if the coefficient matrix is NOT diagonally dominant?",
         "Guaranteed to diverge", "May still converge if spectral radius rho(H) < 1, but diagonal dominance is the standard sufficient guarantee", "Crashes the CPU", "Produces imaginary roots",
         "B", "Strict diagonal dominance is sufficient but not necessary; convergence holds whenever spectral radius < 1."),

        ("Relaxation methods (SOR - Successive Over-Relaxation) introduce a parameter omega. For over-relaxation to accelerate convergence, omega must satisfy:",
         "0 < omega < 1", "1 < omega < 2", "omega > 2", "omega = 0",
         "B", "SOR with 1 < omega < 2 accelerates convergence; 0 < omega < 1 is under-relaxation used for divergent systems."),

        ("Which matrix norm is defined as the maximum absolute row sum: max_i sum_j |a_ij|?",
         "Frobenius Norm", "Infinity Norm (||A||_inf)", "1-Norm (||A||_1)", "Euclidean Norm",
         "B", "The infinity norm is the maximum row sum; the 1-norm is the maximum column sum."),

        ("If det(A) = 0 for coefficient matrix A in A*X = B, the system has:",
         "Unique solution", "Either no solution (inconsistent) or infinitely many solutions", "Only trivial solution X=0", "Integer solutions only",
         "B", "A singular matrix det(A)=0 indicates linearly dependent rows, resulting in either infinite solutions or inconsistency.")
    ]

    # Add Finite Differences, Interpolation, Numerical Differentiation & Integration, ODEs (41-100)
    raw.extend([
        # 4. Finite Differences & Operator Algebra (41-55)
        ("The Forward Difference Operator Delta operating on y_0 is defined as:",
         "y_1 - y_0", "y_0 - y_(-1)", "y_1 + y_0", "(y_1 - y_0) / h",
         "A", "The forward difference Delta y_i = y_(i+1) - y_i."),

        ("The Backward Difference Operator Nabla operating on y_1 is defined as:",
         "y_2 - y_1", "y_1 - y_0", "y_0 - y_1", "y_1 + y_0",
         "B", "The backward difference Nabla y_i = y_i - y_(i-1)."),

        ("The Shift Operator E operating on y_i produces:",
         "y_i + 1", "y_(i+1)", "y_(i-1)", "h * y_i",
         "B", "The shift operator shifts the argument by one interval step h: E y_i = y_(i+1)."),

        ("What is the algebraic relationship between the Shift operator E and Forward Difference operator Delta?",
         "E = Delta - 1", "E = 1 + Delta (Delta = E - 1)", "E = 1 / Delta", "E * Delta = 1",
         "B", "Since E y = y(x + h) = y(x) + Delta y(x) = (1 + Delta) y, we have E = 1 + Delta."),

        ("What is the algebraic relationship between the Shift operator E and Backward Difference operator Nabla?",
         "Nabla = 1 - E^(-1)", "Nabla = E + 1", "Nabla = E^(-1) - 1", "Nabla = E",
         "A", "Nabla y_i = y_i - y_(i-1) = (1 - E^(-1)) y_i, so Nabla = 1 - E^(-1)."),

        ("The Central Difference Operator delta operating on y_i is defined as:",
         "y_(i+1) - y_i", "y_(i + 1/2) - y_(i - 1/2)", "y_i - y_(i-1)", "0.5 * (y_(i+1) + y_(i-1))",
         "B", "The central difference delta y_i = y_(i + 1/2) - y_(i - 1/2) = (E^(1/2) - E^(-1/2)) y_i."),

        ("The Averaging Operator mu is defined as:",
         "0.5 * (E^(1/2) + E^(-1/2))", "0.5 * (E - 1)", "E^(1/2) - E^(-1/2)", "E + E^(-1)",
         "A", "mu y_i = 0.5 * [y_(i + 1/2) + y_(i - 1/2)] = 0.5 * (E^(1/2) + E^(-1/2)) y_i."),

        ("What is the n-th forward difference Delta^n of a polynomial of degree n: P_n(x) = a_n * x^n + ...?",
         "0", "n! * a_n * h^n (a constant)", "n * a_n * h", "Infinity",
         "B", "The n-th difference of an n-th degree polynomial is constant: Delta^n P_n(x) = n! * a_n * h^n."),

        ("What is the (n + 1)-th forward difference Delta^(n + 1) of a polynomial of degree n?",
         "Constant", "0", "1", "h^(n+1)",
         "B", "Since the n-th difference of a degree-n polynomial is constant, all subsequent differences are zero: Delta^(n+1) P_n(x) = 0."),

        ("What is the value of Delta (c) where 'c' is an invariant constant?",
         "c", "0", "1", "-c",
         "B", "For constant c, Delta c = c - c = 0."),

        ("Evaluate Delta (x^2) with step length h = 1:",
         "2x + 1", "2x", "x + 1", "x^2 + 1",
         "A", "Delta (x^2) = (x + 1)^2 - x^2 = x^2 + 2x + 1 - x^2 = 2x + 1."),

        ("What is the fundamental operator relation connecting Shift operator E, interval h, and differential operator D = d/dx?",
         "E = e^(h*D)", "E = 1 + h*D", "E = log(h*D)", "E = h / D",
         "A", "By Taylor expansion: E f(x) = f(x + h) = sum (hD)^n / n! f(x) = e^(hD) f(x). Hence E = e^(hD)."),

        ("The factorial polynomial x^(3) (x to the 3rd factorial power) with step h = 1 is defined as:",
         "x^3", "x(x - 1)(x - 2)", "x(x + 1)(x + 2)", "x^3 - 3x",
         "B", "Factorial notation: x^(n) = x(x - 1)(x - 2)...(x - n + 1). For n=3: x(x - 1)(x - 2)."),

        ("What is the first difference Delta [x^(n)] of a factorial polynomial with step h = 1?",
         "n * x^(n - 1)", "x^(n + 1)", "n! * x", "0",
         "A", "Factorial polynomials mirror standard differentiation under differences: Delta x^(n) = n * x^(n - 1)."),

        ("The relation between central difference operator delta and shift operator E is:",
         "delta = E^(1/2) - E^(-1/2)", "delta = E - 1", "delta = E + 1", "delta = E^(1/2)",
         "A", "delta = E^(1/2) - E^(-1/2)."),

        # 5. Interpolation for Equal & Unequal Intervals (56-75)
        ("Newton's Forward Interpolation Formula is best suited for interpolating values of y at x located:",
         "Near the end of a tabulated set of values", "Near the beginning of a tabulated set of values", "Near the center of the table", "Far outside the table range",
         "B", "Newton's Forward formula utilizes forward differences from the top, ideal near x_0."),

        ("Newton's Backward Interpolation Formula is primarily employed when the target value of x is:",
         "Near the beginning of the table", "Near the end of the tabulated values", "At the exact midpoint", "Only for unequal intervals",
         "B", "Newton's Backward formula begins at the base x_n and propagates upward via backward differences Nabla."),

        ("What parameter 'u' (or 'p') is used in Newton's Forward Interpolation formula?",
         "u = (x - x_0) / h", "u = (x - x_n) / h", "u = (x_n - x) / h", "u = x * h",
         "A", "In Newton's forward formula, the normalized step variable is u = (x - x_0)/h."),

        ("What parameter 'v' (or 'p') is used in Newton's Backward Interpolation formula?",
         "v = (x - x_0) / h", "v = (x - x_n) / h", "v = (x_n + x) / h", "v = x / h",
         "B", "In Newton's backward formula, the variable is measured from the end: v = (x - x_n)/h."),

        ("Which central difference interpolation formula uses the arithmetic mean of Gauss Forward and Gauss Backward formulas?",
         "Bessel's Formula", "Stirling's Formula", "Everett's Formula", "Lagrange's Formula",
         "B", "Stirling's formula is the arithmetic average of Gauss forward and Gauss backward interpolation formulas."),

        ("Which central difference formula involves ONLY even differences and is widely used for astronomy tables?",
         "Stirling's Formula", "Bessel's Formula", "Everett's Formula", "Newton's Forward",
         "C", "Everett's formula expresses interpolation solely in terms of function values and even backward/central differences."),

        ("Stirling's central difference interpolation formula produces optimal accuracy when |u| satisfies:",
         "|u| < 0.25", "0.25 < |u| < 0.75", "|u| > 1", "u = 0 exclusively",
         "A", "Stirling's formula gives best accuracy near the center where -0.25 <= u <= 0.25 (Bessel is preferred for 0.25 <= u <= 0.75)."),

        ("Lagrange's Interpolation Formula is applicable for:",
         "Equally spaced intervals only", "Both equally and unequally spaced intervals of argument x", "Only two data points", "Periodic functions only",
         "B", "Lagrange interpolation does not require equal step spacing h; it handles arbitrary distinct abscissas."),

        ("In Lagrange's interpolation formula with n+1 points, each Lagrange coefficient polynomial L_i(x) satisfies:",
         "L_i(x_j) = 1 for all j", "L_i(x_j) = 1 if i = j, and 0 if i != j (Kronecker delta)", "L_i(x_j) = 0 everywhere", "L_i(x) is of degree n+1",
         "B", "Lagrange cardinal polynomials satisfy the cardinal property L_i(x_j) = delta_ij."),

        ("What is the degree of the unique interpolating polynomial fitting (n + 1) distinct data points?",
         "n + 1", "At most n", "n - 1", "2n",
         "B", "By the polynomial interpolation uniqueness theorem, exactly one polynomial of degree at most n passes through n+1 points."),

        ("The first divided difference of f(x) over distinct points x_0 and x_1 is denoted and defined as:",
         "f[x_0, x_1] = (f(x_1) - f(x_0)) / (x_1 - x_0)", "f[x_0, x_1] = f(x_1) - f(x_0)", "f[x_0, x_1] = (x_1 - x_0) / (f(x_1) - f(x_0))", "f[x_0, x_1] = f(x_1) + f(x_0)",
         "A", "The first divided difference is the slope of the secant chord: f[x_0, x_1] = (f(x_1) - f(x_0))/(x_1 - x_0)."),

        ("Divided differences possess which important mathematical symmetry property?",
         "They change sign when arguments are swapped", "They are completely symmetric functions of their arguments (invariant to permutations)", "They depend on order of points", "They must always be positive",
         "B", "Divided differences are symmetric: f[x_0, x_1] = f[x_1, x_0], and f[x_0, x_1, x_2] is invariant to any rearrangement of arguments."),

        ("If two arguments in a divided difference coincide, f[x_0, x_0] equals:",
         "0", "f'(x_0) (The first derivative at x_0)", "f(x_0)", "Undefined",
         "B", "By taking the limit as x_1 -> x_0, f[x_0, x_1] becomes lim (f(x_1) - f(x_0))/(x_1 - x_0) = f'(x_0)."),

        ("What is the n-th divided difference of a polynomial of degree n?",
         "Zero", "Constant (equal to leading coefficient a_n)", "Depends on x", "n!",
         "B", "The n-th divided difference of an n-th degree polynomial P(x) = a_n * x^n + ... is constant and equals a_n."),

        ("What is the (n + 1)-th divided difference of a polynomial of degree n?",
         "Constant", "0", "1", "-1",
         "B", "All divided differences of order higher than the degree of the polynomial are identically zero."),

        ("What is the main practical drawback of Lagrange's interpolation formula compared to Newton's Divided Difference form?",
         "Lagrange is inaccurate", "Adding a new data point requires recomputing all Lagrange basis terms from scratch", "Lagrange requires equal steps", "Lagrange cannot be graphed",
         "B", "Newton's divided difference form is incremental: adding a point simply appends one new term without invalidating previous terms."),

        ("Inverse Interpolation is the process of:",
         "Finding the derivative from integral", "Finding the value of the independent variable x corresponding to a given y", "Inverting a matrix", "Reversing difference tables",
         "B", "Inverse interpolation solves for x given y = f(x), using Lagrange's formula treating x as a function of y."),

        ("Hermite's Interpolation formula matches:",
         "Only function values at points", "Both function values y_i AND first derivative values y'_i at every node", "Second derivatives only", "Only integrals",
         "B", "Hermite interpolation fits a polynomial matching both y(x_i) and y'(x_i), yielding degree 2n+1 for n+1 nodes."),

        ("Cubic Spline interpolation fits piecewise cubic polynomials between adjacent points with continuous:",
         "Function values only", "First and second derivatives at all interior knots", "Third derivatives", "Slopes only",
         "B", "A cubic spline S(x) guarantees continuity of S(x), S'(x), and S''(x) across all knot points, avoiding Runge phenomenon oscillations."),

        ("Runge's Phenomenon refers to:",
         "Matrix singularity", "Severe wild edge oscillations when high-degree polynomial interpolation is used with equispaced nodes", "Division by zero in bisection", "Slow convergence of Euler",
         "B", "Interpolating functions like 1/(1 + 25x^2) with high-degree polynomials causes severe divergence near the interval endpoints."),

        # 6. Numerical Differentiation & Quadrature (76-88)
        ("In numerical differentiation using Newton's Forward formula, the first derivative dy/dx at x = x_0 is given by:",
         "(1/h) * [Delta y_0 - (1/2)*Delta^2 y_0 + (1/3)*Delta^3 y_0 - ...]", "(1/h) * [Delta y_0 + Delta^2 y_0]", "h * Delta y_0", "(1/h) * Delta y_0",
         "A", "Differentiating Newton's forward series with respect to x gives dy/dx = (1/h)*[Delta y_0 - 1/2 Delta^2 y_0 + 1/3 Delta^3 y_0 - ...]."),

        ("The second derivative d^2y/dx^2 at x = x_0 from Newton's Forward differences is:",
         "(1/h^2) * [Delta^2 y_0 - Delta^3 y_0 + (11/12)*Delta^4 y_0 - ...]", "(1/h) * Delta^2 y_0", "h^2 * Delta^2 y_0", "Delta^2 y_0 / 2",
         "A", "The second derivative at the base node is d^2y/dx^2 = (1/h^2)*[Delta^2 y_0 - Delta^3 y_0 + 11/12 Delta^4 y_0 - ...]."),

        ("What degree polynomial is assumed by the Trapezoidal Rule over each subinterval?",
         "Constant (degree 0)", "Linear (degree 1 / straight line chord)", "Parabolic (degree 2)", "Cubic (degree 3)",
         "B", "Trapezoidal rule connects adjacent points with straight line segments (linear polynomial)."),

        ("What is the formula for the Composite Trapezoidal Rule for integral from a to b with n intervals of width h?",
         "(h/2) * [(y_0 + y_n) + 2*(y_1 + y_2 + ... + y_(n-1))]", "h * (y_0 + y_1 + ... + y_n)", "(h/3) * (y_0 + 4*y_1 + y_2)", "h/2 * (y_0 - y_n)",
         "A", "Trapezoidal rule sums: (h/2) * [endpoint sum + 2 * (interior sum)]."),

        ("What is the global truncation error order of the Composite Trapezoidal Rule?",
         "O(h)", "O(h^2)", "O(h^3)", "O(h^4)",
         "B", "Trapezoidal rule error is proportional to h^2: Error = - (b - a)/12 * h^2 * f''(xi) = O(h^2)."),

        ("Simpson's 1/3 Rule approximates the integrand curve using which polynomial curve?",
         "Straight line", "Parabola (quadratic polynomial of degree 2)", "Cubic spline", "Exponential",
         "B", "Simpson's 1/3 rule fits a parabola through 3 consecutive points across 2 intervals."),

        ("To apply Simpson's 1/3 Rule, the total number of subintervals 'n' must strictly be:",
         "Any integer", "An Even number (multiple of 2)", "An Odd number", "A multiple of 3",
         "B", "Simpson's 1/3 rule pairs subintervals into twos; hence n must strictly be an even integer."),

        ("What is the formula for Composite Simpson's 1/3 Rule?",
         "(h/3) * [(y_0 + y_n) + 4*(sum of odd ordinates) + 2*(sum of even ordinates)]", "(h/2) * [(y_0 + y_n) + 2*(interior ordinates)]", "(3h/8) * (y_0 + 3y_1 + 3y_2 + y_3)", "h * sum(y_i)",
         "A", "Simpson's 1/3 rule weights: 1 for endpoints, 4 for odd indices (1, 3, 5...), and 2 for even indices (2, 4, 6...)."),

        ("What is the order of accuracy (global truncation error) of Simpson's 1/3 Rule?",
         "O(h)", "O(h^2)", "O(h^4)", "O(h^6)",
         "C", "Simpson's 1/3 rule has global error O(h^4): Error = - (b - a)/180 * h^4 * f^(4)(xi)."),

        ("Simpson's 1/3 Rule integrates polynomials of up to which degree with ZERO error?",
         "Degree 1", "Degree 2", "Degree 3 (Cubic polynomials)", "Degree 4",
         "C", "Due to odd-order error cancellation, Simpson's 1/3 rule is exact for polynomials up to degree 3."),

        ("To apply Simpson's 3/8 Rule, the total number of subintervals 'n' must strictly be a multiple of:",
         "2", "3", "4", "5",
         "B", "Simpson's 3/8 rule groups subintervals into sets of 3, requiring n to be a multiple of 3."),

        ("What is the formula for Simpson's 3/8 Rule for n = 3 intervals?",
         "(3h/8) * [y_0 + 3*y_1 + 3*y_2 + y_3]", "(h/3) * [y_0 + 4y_1 + y_2]", "(h/2) * [y_0 + 2y_1 + y_2]", "3h * (y_0 + y_3)",
         "A", "Simpson's 3/8 rule weights 3 intervals as: (3h/8) * [y_0 + 3y_1 + 3y_2 + y_3]."),

        ("Weddle's Rule for numerical integration requires dividing the interval into a multiple of how many subintervals?",
         "2 subintervals", "4 subintervals", "6 subintervals", "8 subintervals",
         "C", "Weddle's rule approximates a 6th degree polynomial across 6 subintervals: (3h/10) * [y0 + 5y1 + y2 + 6y3 + y4 + 5y5 + y6]."),

        # 7. Ordinary Differential Equations (ODEs) (89-100)
        ("In solving dy/dx = f(x, y) with initial condition y(x_0) = y_0, Euler's Method step formula is:",
         "y_(n+1) = y_n + h * f(x_n, y_n)", "y_(n+1) = y_n + (h/2) * f(x_n, y_n)", "y_(n+1) = y_n - h * f(x_n, y_n)", "y_(n+1) = y_n + h^2 * f(x_n, y_n)",
         "A", "Euler's method follows the tangent slope: y_(n+1) = y_n + h * f(x_n, y_n)."),

        ("What is the local and global truncation error order of standard Euler's method?",
         "Local O(h^2), Global O(h)", "Local O(h), Global O(h^2)", "Local O(h^3), Global O(h^2)", "Both O(h)",
         "A", "Euler's method incurs O(h^2) local truncation error per step, accumulating to O(h) global error across the interval."),

        ("Modified Euler's (Heun's) Method is a Predictor-Corrector method of order:",
         "1", "2 (Second Order)", "3", "4",
         "B", "Modified Euler predicts with Euler and corrects with trapezoidal average of slopes, achieving 2nd order accuracy O(h^2)."),

        ("In Modified Euler's method, what is the corrector formula for y_(n+1)?",
         "y_(n+1) = y_n + (h/2) * [f(x_n, y_n) + f(x_(n+1), y*_(n+1))]", "y_(n+1) = y_n + h * f(x_n, y_n)", "y_(n+1) = y_n + h * f(x_(n+1), y*_(n+1))", "y_(n+1) = (y_n + y*_(n+1)) / 2",
         "A", "The corrector averages initial and predicted slopes: y_(n+1) = y_n + (h/2)*[f(x_n, y_n) + f(x_(n+1), y*_(n+1))]."),

        ("In the classical Runge-Kutta 4th Order Method (RK4), how many slope evaluations (k1, k2, k3, k4) are computed per step?",
         "2 evaluations", "4 evaluations", "6 evaluations", "8 evaluations",
         "B", "RK4 computes 4 slopes: k1 at start, k2 at midpoint using k1, k3 at midpoint using k2, and k4 at full step using k3."),

        ("What is the formula for the weighted average step update in RK4 method?",
         "y_(n+1) = y_n + (1/6) * (k1 + 2*k2 + 2*k3 + k4)", "y_(n+1) = y_n + (1/4) * (k1 + k2 + k3 + k4)", "y_(n+1) = y_n + (1/2) * (k1 + k4)", "y_(n+1) = y_n + (1/8) * (k1 + 3k2 + 3k3 + k4)",
         "A", "RK4 weighted increment is Delta y = (k1 + 2k2 + 2k3 + k4)/6."),

        ("What is the order of global truncation error of the classical RK4 method?",
         "O(h^2)", "O(h^3)", "O(h^4)", "O(h^5)",
         "C", "RK4 matches Taylor series expansion through h^4 terms, possessing global error O(h^4) and local error O(h^5)."),

        ("Picard's Method of Successive Approximations solves dy/dx = f(x, y) by iteratively computing:",
         "y_k(x) = y_0 + integral from x_0 to x of f(t, y_(k-1)(t)) dt", "Finite difference quotients", "Matrix inverses", "Taylor series derivatives",
         "A", "Picard's method converts ODE into an integral equation solved iteratively: y_k(x) = y_0 + int_{x_0}^x f(t, y_(k-1)(t)) dt."),

        ("Taylor Series Method for ODEs requires computing:",
         "Successive analytical higher-order derivatives of y(x) at x_0", "Only numerical differences", "Matrix eigenvalues", "Fourier transforms",
         "A", "Taylor series evaluates y(x_0 + h) = y_0 + h*y'_0 + (h^2/2!)*y''_0 + ... by differentiating dy/dx = f(x, y)."),

        ("Milne's Predictor-Corrector method requires how many prior starting values before it can step forward?",
         "1 value", "2 values", "4 prior values (y_0, y_1, y_2, y_3)", "6 values",
         "C", "Milne's method is a 4-step multi-step method requiring 4 starting values (typically generated by RK4)."),

        ("What is Milne's Predictor formula to compute y_(n+1)?",
         "y_(n+1) = y_(n-3) + (4h/3) * [2*f_n - f_(n-1) + 2*f_(n-2)]", "y_(n+1) = y_n + h * f_n", "y_(n+1) = y_(n-1) + 2h*f_n", "y_(n+1) = y_(n-2) + 3h*f_n",
         "A", "Milne predictor uses: y_(n+1) = y_(n-3) + (4h/3)*[2*f_n - f_(n-1) + 2*f_(n-2)]."),

        ("What is Milne's Corrector formula for y_(n+1)?",
         "y_(n+1) = y_(n-1) + (h/3) * [f_(n+1) + 4*f_n + f_(n-1)] (Based on Simpson's 1/3 Rule)", "y_(n+1) = y_n + (h/2)*[f_n + f_(n+1)]", "y_(n+1) = y_(n-3) + (h/3)*f_(n+1)", "y_(n+1) = y_n + 4h*f_n",
         "A", "Milne corrector applies Simpson's 1/3 rule across 2 intervals: y_(n+1) = y_(n-1) + (h/3)*[f_(n+1) + 4*f_n + f_(n-1)].")
    ])

    questions = []
    for idx, item in enumerate(raw):
        qid = f"bca-nm-q{idx+1:03d}"
        diff = "Easy" if idx < 30 else ("Moderate" if idx < 75 else "Hard")
        topic_name = "Errors & Approximations" if idx < 10 else ("Root Finding Methods" if idx < 25 else ("Linear Systems" if idx < 40 else ("Finite Differences" if idx < 55 else ("Interpolation" if idx < 75 else ("Numerical Calculus" if idx < 88 else "ODEs & Initial Value")))))
        topic_id = f"top-nm-{(idx // 20) + 1}"
        questions.append({
            "id": qid,
            "order": idx + 1,
            "questionText": item[0],
            "questionType": "MCQ",
            "difficulty": diff,
            "subjectId": "sub-bca-504",
            "subjectName": "Numerical Methods (BCA-504)",
            "topicId": topic_id,
            "topicName": topic_name,
            "marks": 1.0,
            "negativeMarks": 0.25,
            "explanation": item[6],
            "options": [
                {"id": f"{qid}-a", "optionKey": "A", "optionText": item[1], "isCorrect": item[5] == "A"},
                {"id": f"{qid}-b", "optionKey": "B", "optionText": item[2], "isCorrect": item[5] == "B"},
                {"id": f"{qid}-c", "optionKey": "C", "optionText": item[3], "isCorrect": item[5] == "C"},
                {"id": f"{qid}-d", "optionKey": "D", "optionText": item[4], "isCorrect": item[5] == "D"},
            ]
        })
    return questions

if __name__ == "__main__":
    qs = get_numerical_questions()
    print(f"Loaded {len(qs)} Numerical Methods questions.")
