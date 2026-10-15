# scripts/bca_data_java.py
# 100 High-Yield Questions for Java Programming & Dynamic Webpage Design (BCA-502) from CCSU Syllabus & Solved PYQs

def get_java_questions():
    raw = [
        # 1. Java Fundamentals, JVM Architecture & Execution (1-15)
        ("Which component of the Java platform is responsible for loading, verifying, and executing compiled bytecode?",
         "Java Virtual Machine (JVM)", "Java Development Kit (JDK)", "javac Compiler", "Java Classpath",
         "A", "The JVM loads class files, verifies bytecode integrity, and executes instructions on host hardware."),

        ("Java source code (.java) is compiled into an intermediate architecture-neutral format known as:",
         "Assembly Code", "Bytecode (.class file)", "Native Binary", "Object Code",
         "B", "The javac compiler translates human-readable Java code into bytecode stored in .class files."),

        ("Which feature of Java enables the 'Write Once, Run Anywhere' (WORA) philosophy?",
         "Direct execution by operating system", "Compilation into platform-independent bytecode executed by platform-specific JVMs", "Pointers and direct memory access", "Absence of type checking",
         "B", "Bytecode is platform-neutral; any operating system with a JVM port can execute the same .class file."),

        ("The Just-In-Time (JIT) compiler inside the JVM enhances performance by:",
         "Compiling all source code ahead-of-time", "Translating frequently executed bytecode hot-spots into native machine instructions at runtime", "Interpreting code line-by-line exclusively", "Compressing class files",
         "B", "JIT compiles frequently executed bytecode loops into native machine code to dramatically accelerate execution."),

        ("Which memory area in the JVM stores class structures, method metadata, and static fields?",
         "Call Stack", "Heap Space", "Method Area (Metaspace in Java 8+)", "Program Counter Register",
         "C", "The Method Area / Metaspace stores runtime class definitions, static variables, and method bytecode."),

        ("In Java, all newly instantiated objects and arrays are dynamically allocated memory in:",
         "Stack Memory", "Heap Memory", "Code Segment", "CPU Registers",
         "B", "Objects reside on the Heap, while local variable references to them reside on the thread call Stack."),

        ("What happens to an object when it is no longer referenced by any reachable thread in Java?",
         "It throws a NullPointerException", "It becomes eligible for automatic Garbage Collection", "It causes an immediate memory dump", "It is written to virtual swap disk",
         "B", "Objects without active references become eligible for reclaim by the JVM Garbage Collector."),

        ("Which method in java.lang.Object was traditionally called by the Garbage Collector before reclaiming memory?",
         "dispose()", "finalize()", "destroy()", "clean()",
         "B", "The finalize() method provided clean-up hooks before object reclamation (deprecated in modern Java)."),

        ("What is the effect of invoking System.gc() in a Java application?",
         "Guarantees immediate and complete synchronous garbage collection", "Requests or suggests that the JVM run garbage collection, but execution is non-deterministic", "Deletes all null pointers", "Halts the virtual machine",
         "B", "System.gc() merely hints to the JVM that garbage collection should run; the JVM decides if and when to do so."),

        ("Which tool in the JDK is used to generate standard HTML documentation from doc-comments (/** ... */)?",
         "javap", "javadoc", "jdb", "jar",
         "B", "The javadoc tool parses code comments to generate standard HTML API reference documentation."),

        ("Which tool in the JDK is used to disassemble compiled .class files and inspect their bytecode?",
         "javap", "javac", "jar", "jconsole",
         "A", "javap disassembles compiled class files to reveal method signatures, constants, and raw bytecode."),

        ("Which of the following is NOT a primitive data type in Java?",
         "byte", "boolean", "String", "double",
         "C", "String is a reference class type (java.lang.String), whereas byte, boolean, and double are primitives."),

        ("What is the memory size of the 'char' primitive data type in Java?",
         "8 bits (ASCII)", "16 bits (Unicode UTF-16)", "32 bits", "64 bits",
         "B", "Java char is an unsigned 16-bit integer representing Unicode code points (\u0000 to \uffff)."),

        ("What is the default value of an uninitialized boolean instance variable in a class?",
         "true", "false", "0", "null",
         "B", "Boolean instance and static fields default to false in Java; local variables have no default and require explicit assignment."),

        ("What is the size and range of the primitive 'byte' data type in Java?",
         "8-bit signed integer (-128 to 127)", "8-bit unsigned integer (0 to 255)", "16-bit signed integer", "4-bit nibble",
         "A", "Java byte is a 2's complement 8-bit signed integer ranging from -128 to +127."),

        # 2. Operators, Control Flow, Strings & Arrays (16-30)
        ("What is the output of the expression `10 + 20 + \"Java\"` in Java?",
         "\"1020Java\"", "\"30Java\"", "\"Java1020\"", "\"Java30\"",
         "B", "Operators evaluate left-to-right: 10 + 20 yields 30, then 30 + 'Java' performs string concatenation producing '30Java'."),

        ("What is the output of the expression `\"Java\" + 10 + 20` in Java?",
         "\"Java30\"", "\"Java1020\"", "\"30Java\"", "Compilation Error",
         "B", "Left-to-right evaluation starts with string concatenation: 'Java' + 10 = 'Java10', then 'Java10' + 20 = 'Java1020'."),

        ("Which operator in Java tests whether an object reference is an instance of a specified class or interface?",
         "typeof", "instanceof", "is_a", "cast",
         "B", "The instanceof operator evaluates whether an object reference implements an interface or subclasses a type."),

        ("What is the difference between `==` and `.equals()` when comparing two String objects in Java?",
         "`==` compares character content; `.equals()` compares memory addresses", "`==` compares object references (memory address); `.equals()` compares string content", "Both perform identical comparisons", "`.equals()` can only be used on primitive types",
         "B", "The `==` operator tests reference identity (same memory address), while `String.equals()` compares text values."),

        ("Why are String objects considered 'immutable' in Java?",
         "Because their variable references cannot be reassigned", "Because their internal character sequence cannot be modified after creation in memory", "Because they can only be used in multi-threaded programs", "Because they are primitive values",
         "B", "Once created, the internal char/byte buffer of a String cannot be changed. Any mutation returns a brand new String object."),

        ("Which class should be preferred when extensive string modifications (concatenations) occur in a single-threaded environment?",
         "String", "StringBuffer", "StringBuilder", "Vector",
         "C", "StringBuilder provides mutable string operations without synchronization overhead, making it faster than StringBuffer."),

        ("What makes StringBuffer thread-safe compared to StringBuilder?",
         "StringBuffer uses final variables", "StringBuffer methods are synchronized", "StringBuffer runs on the GPU", "StringBuffer does not use heap memory",
         "B", "StringBuffer methods are decorated with the `synchronized` keyword, preventing data races in concurrent threads."),

        ("What will happen if you attempt to access an array index that is negative or greater than or equal to `array.length`?",
         "Returns null", "Returns 0", "Throws ArrayIndexOutOfBoundsException at runtime", "Causes a compiler error",
         "C", "Java performs runtime boundary checking and throws ArrayIndexOutOfBoundsException for invalid indices."),

        ("How is the length of an array determined in Java?",
         "array.length() method call", "array.length attribute/property", "array.size() method call", "sizeof(array)",
         "B", "In Java, arrays expose an immutable public field `.length` (strings use the method `.length()`)."),

        ("Which loop construct in Java guarantees that the loop body will execute at least once?",
         "for loop", "while loop", "do-while loop", "for-each loop",
         "C", "The do-while loop evaluates its termination condition at the bottom, guaranteeing at least one execution."),

        ("In Java switch statements (prior to Java 14), which data types are permitted as switch selector expressions?",
         "Only boolean and float", "byte, short, char, int, String, and enum types", "float, double, and long", "Only integer constants",
         "B", "Switch statements support integral primitives (byte, short, char, int), wrappers, Enums, and Strings."),

        ("What happens in a switch statement if a matching case block omits the `break` statement?",
         "Compiler generates an error", "Execution falls through into the subsequent case blocks until a break or switch end", "The JVM crashes", "Default block executes immediately",
         "B", "Omitting break results in fall-through behavior, executing subsequent case statements sequentially."),

        ("Which keyword is used to terminate the current loop iteration and jump immediately to the next iteration?",
         "break", "continue", "return", "skip",
         "B", "continue skips the remainder of the current iteration and advances the loop counter to the next cycle."),

        ("What is the index of the first command-line argument in `public static void main(String[] args)`?",
         "args[0]", "args[1]", "args[-1]", "args.first()",
         "A", "Unlike C/C++ where argv[0] is the program name, Java's args[0] is the first actual user argument passed."),

        ("What is the output of `Math.floor(-3.7)` in Java?",
         "-3.0", "-4.0", "3.0", "-3.7",
         "B", "Math.floor rounds down to the nearest mathematical integer less than or equal to the argument (-4.0)."),

        # 3. Object-Oriented Programming, Classes & Inheritance (31-50)
        ("A constructor in Java is characterized by which of the following rules?",
         "Must return void explicitly", "Must share the exact same name as the class and declare no return type", "Must be declared static", "Cannot accept parameters",
         "B", "Constructors share the class name, have no return type (not even void), and initialize newly created objects."),

        ("If a class does not define any constructor, what does the Java compiler supply?",
         "No constructor is provided", "A default no-argument constructor with an empty body and super() call", "A private constructor", "A parameterized constructor",
         "B", "The compiler injects a default public no-arg constructor if and only if no explicit constructors are defined."),

        ("The `this` keyword in Java is a reference variable that points to:",
         "The parent superclass object", "The current class instance invoking the method or constructor", "The static class definition", "The JVM garbage collector",
         "B", "The `this` keyword refers to the current invoking instance, often used to resolve variable shadowing."),

        ("How can one constructor in a class explicitly invoke another overloaded constructor in the same class?",
         "Using super() as the first statement", "Using this() as the first executable statement in the constructor", "Using new this()", "Constructors cannot call each other",
         "B", "Explicit constructor invocation in the same class uses this(...) and must strictly be the first line of code."),

        ("Which keyword in Java is used to inherit all non-private fields and methods from a superclass?",
         "implements", "extends", "inherits", "super",
         "B", "The `extends` keyword establishes class inheritance: `class Dog extends Animal`."),

        ("Does Java support Multiple Inheritance of classes directly?",
         "Yes, using commas like `class C extends A, B`", "No, Java avoids diamond ambiguity by disallowing multiple class inheritance, supporting it only via Interfaces", "Yes, but only for abstract classes", "Only in Java 17+",
         "B", "Java disallows multiple class inheritance to prevent the Diamond Problem, providing interfaces instead."),

        ("Which keyword is used by a subclass to invoke an overridden method or constructor of its immediate superclass?",
         "this", "super", "parent", "base",
         "B", "The `super` keyword calls superclass constructors (`super()`) or overridden superclass methods (`super.method()`)."),

        ("What is Method Overloading (Compile-Time Polymorphism) in Java?",
         "Defining methods with identical names but different parameter lists (type, count, or order) within the same class", "Overriding a method in a child class with the identical signature", "Declaring a method as private", "Calling a method dynamically via reflection",
         "A", "Overloading occurs when methods in the same class share names but have differing argument signatures."),

        ("What is Method Overriding (Runtime Polymorphism) in Java?",
         "Writing methods with same names but different parameter counts", "A subclass providing a specific implementation of a method already defined in its superclass with identical name and parameter signature", "Making a method static", "Overloading constructors",
         "B", "Overriding lets a subclass replace superclass behavior with exact signature and compatible return type."),

        ("Can a static method in Java be overridden by a subclass?",
         "Yes, dynamic polymorphism applies to all methods", "No, static methods are resolved at compile-time and are hidden (method hiding), not overridden", "Only if marked synchronized", "Only if declared in an interface",
         "B", "Static methods belong to the class, not instances. Re-declaring a static method in a subclass hides it rather than overrides it."),

        ("Which modifier prevents a class from being inherited (subclassed) in Java?",
         "abstract", "final", "static", "sealed only",
         "B", "A `final` class cannot be extended by any other class (e.g., java.lang.String is final)."),

        ("Which modifier applied to a method prevents that method from being overridden in subclasses?",
         "static", "final", "abstract", "protected",
         "B", "Declaring a method `final` prevents child classes from altering its implementation."),

        ("Which modifier applied to a variable makes its value constant and unchangeable once initialized?",
         "const", "final", "immutable", "static",
         "B", "A `final` variable acts as a constant: once assigned, its value cannot be re-bound."),

        ("An `abstract` class in Java:",
         "Cannot contain concrete methods", "Cannot be directly instantiated with the `new` operator", "Cannot declare constructors", "Must contain only abstract methods",
         "B", "Abstract classes serve as blueprints; they cannot be instantiated directly and may contain both concrete and abstract methods."),

        ("Can an abstract class define a constructor?",
         "No, abstract classes cannot have constructors", "Yes, invoked via super() by subclasses during subclass instantiation", "Only if the constructor is private", "Only static constructors",
         "B", "Abstract classes have constructors to initialize their own fields when subclasses call `super()`."),

        ("Which keyword is used by a class to implement one or more interfaces?",
         "extends", "implements", "inherits", "interfaceof",
         "B", "The `implements` keyword binds a class to one or more interface contracts: `class A implements B, C`."),

        ("In Java 8 and later, interfaces can contain concrete method implementations using which modifier?",
         "concrete", "default and static", "virtual", "native",
         "B", "Java 8 introduced `default` and `static` methods inside interfaces to allow backward-compatible API evolution."),

        ("What are the implicit modifiers for all variables declared inside a Java Interface?",
         "private static", "public static final", "protected volatile", "transient",
         "B", "All fields declared in an interface are implicitly `public static final` (constants)."),

        ("What are the implicit modifiers for abstract methods declared inside an interface?",
         "private abstract", "public abstract", "protected abstract", "default void",
         "B", "Interface methods without a body are implicitly `public abstract`."),

        ("Which access modifier restricts the visibility of a class member exclusively to its enclosing class?",
         "default (package-private)", "protected", "private", "public",
         "C", "The `private` modifier restricts visibility solely to the declaring class."),

        # 4. Packages, Access Control & Wrapper Classes (51-65)
        ("What is the default access level of a member in Java when no access specifier is declared?",
         "Public", "Private", "Package-Private (accessible by classes within the same package)", "Protected",
         "C", "Default access (package-private) permits access from any class located inside the identical package."),

        ("A `protected` member in a Java class is accessible to:",
         "Classes in the same package and subclasses in any package", "Only subclasses in the same package", "Every class across the entire JVM", "Only the declaring class",
         "A", "Protected members can be accessed within the same package and by derived subclasses in external packages."),

        ("Which keyword is used at the very beginning of a Java source file to place classes into a namespace folder hierarchy?",
         "import", "package", "namespace", "module",
         "B", "The `package` statement must be the first non-comment statement in a source file."),

        ("Which Java package is automatically imported by the compiler into every Java program without an explicit import statement?",
         "java.util", "java.io", "java.lang", "java.net",
         "C", "java.lang (containing Object, String, Math, System, Thread) is implicitly imported into every compilation unit."),

        ("What is 'Autoboxing' in Java?",
         "Converting reference objects into byte streams", "Automatic conversion of a primitive type into its corresponding Wrapper class object", "Creating GUI text boxes automatically", "Compressing JAR files",
         "B", "Autoboxing automatically converts primitives (e.g., int) into wrapper objects (Integer) by calling Integer.valueOf()."),

        ("What is 'Unboxing' in Java?",
         "Decompressing a ZIP file", "Automatic conversion of a Wrapper class object into its corresponding primitive type", "Removing a class from a package", "Nullifying an object",
         "B", "Unboxing extracts the primitive value from a wrapper object (e.g., Integer.intValue())."),

        ("Which method is used to parse a numeric String into an `int` primitive in Java?",
         "Integer.parseInt(str)", "Integer.toInteger(str)", "String.toInt(str)", "Math.parseInt(str)",
         "A", "Integer.parseInt(\"123\") converts string digits into a primitive int value."),

        ("What will `Integer.parseInt(\"abc\")` throw at runtime?",
         "NullPointerException", "NumberFormatException", "ArithmeticException", "ClassCastException",
         "B", "NumberFormatException is thrown when a string does not contain a parsable numerical sequence."),

        ("What is the parent class of all classes in the Java class hierarchy?",
         "java.lang.Class", "java.lang.Object", "java.lang.System", "java.lang.Root",
         "B", "java.lang.Object is the ultimate root superclass of every class in Java."),

        ("Which method in java.lang.Object returns a hash code integer value for an object?",
         "getHash()", "hashCode()", "hash()", "id()",
         "B", "The hashCode() method returns an integer hash value used in hash tables like HashMap and HashSet."),

        ("What is the general contract between `equals()` and `hashCode()` in Java?",
         "If two objects are equal according to equals(), they must produce identical hashCodes", "Equal hash codes mean objects must be equal", "There is no relationship", "hashCode() must always return 0",
         "A", "If `a.equals(b)` is true, then `a.hashCode() == b.hashCode()` must strictly hold true."),

        ("Which class in java.lang provides immutable arbitrary-precision integers?",
         "java.math.BigInteger", "java.lang.Long", "java.lang.Double", "java.math.BigDecimal",
         "A", "BigInteger handles arbitrarily large integers with no upper memory boundary."),

        ("Which class in java.lang provides high-precision arithmetic suitable for monetary and financial calculations?",
         "java.lang.Float", "java.math.BigDecimal", "java.lang.Double", "java.lang.Currency",
         "B", "BigDecimal avoids IEEE 754 floating-point rounding errors, making it ideal for financial logic."),

        ("What does the `intern()` method in java.lang.String do?",
         "Encrypts the string", "Returns a canonical representation from the JVM String Constant Pool", "Reverses the string characters", "Converts string to lowercase",
         "B", "String.intern() checks the String Pool; if present, it returns the pooled reference, otherwise it adds it."),

        ("What is the result of `\"hello\" == new String(\"hello\")`?",
         "true", "false", "Compilation Error", "NullPointerException",
         "B", "The `new` operator creates a separate object on the heap, so memory addresses differ and `==` evaluates to false."),

        # 5. Exception Handling (66-75)
        ("All exceptions and errors in Java inherit directly or indirectly from which class?",
         "java.lang.Exception", "java.lang.Throwable", "java.lang.Error", "java.lang.RuntimeException",
         "B", "java.lang.Throwable is the superclass of all exceptions and system errors in the Java language."),

        ("Which category of exceptions is checked by the compiler at compile-time and requires mandatory handling or declaration?",
         "Unchecked Exceptions (RuntimeExceptions)", "Checked Exceptions (subclasses of Exception excluding RuntimeException)", "Errors", "Assertions",
         "B", "Checked exceptions (e.g., IOException, SQLException) must be caught in try-catch or declared in `throws`."),

        ("Which of the following is an example of an Unchecked (Runtime) Exception in Java?",
         "IOException", "SQLException", "NullPointerException", "ClassNotFoundException",
         "C", "NullPointerException extends RuntimeException and is not checked by the compiler."),

        ("Which block in a try-catch-finally construct ALWAYS executes, regardless of whether an exception was thrown or caught?",
         "try block", "catch block", "finally block", "throw block",
         "C", "The finally block executes reliably for clean-up tasks (e.g., closing file descriptors or sockets)."),

        ("Under which specific circumstance will a `finally` block NOT execute in Java?",
         "When an unhandled exception occurs", "When System.exit(0) is executed inside the try block", "When a return statement is encountered in the try block", "When the catch block throws an exception",
         "B", "System.exit() terminates the JVM process immediately, bypassing the finally block."),

        ("What is the purpose of the `throw` keyword in Java?",
         "To declare exceptions thrown by a method signature", "To explicitly trigger/throw an exception instance in code", "To catch an exception", "To suppress an error",
         "B", "The `throw` keyword throws an instance: `throw new IllegalArgumentException(\"Invalid input\");`."),

        ("What is the purpose of the `throws` keyword in Java?",
         "To instantiate an exception object", "To declare in the method signature which checked exceptions may be propagated to the caller", "To suppress stack traces", "To handle exceptions locally",
         "B", "The `throws` keyword advertises checked exceptions in the method signature: `void readFile() throws IOException`."),

        ("Can a single `try` block be associated with multiple `catch` blocks in Java?",
         "No, only one catch block is permitted per try", "Yes, and specific subclasses must precede broader superclass exception handlers", "Yes, in any random order", "Only with Java 21+",
         "B", "Multiple catch blocks are evaluated sequentially; narrower exceptions must appear before broader superclasses."),

        ("What is the Java 7 'try-with-resources' statement designed to do?",
         "Run catch blocks concurrently", "Automatically close resources implementing AutoCloseable without an explicit finally block", "Retry failed database queries", "Catch multiple unchecked errors",
         "B", "Try-with-resources ensures that open streams, connections, and files are automatically closed."),

        ("How do you create a custom user-defined Checked Exception in Java?",
         "Extend java.lang.Throwable directly", "Create a class that extends java.lang.Exception", "Create a class that extends java.lang.RuntimeException", "Implement the Exception interface",
         "B", "Custom checked exceptions subclass java.lang.Exception; custom unchecked exceptions subclass RuntimeException."),

        # 6. Multithreading & Concurrency (76-85)
        ("What are the two primary mechanisms to create a custom Thread in Java?",
         "By extending java.lang.Thread OR implementing java.lang.Runnable", "By extending Object OR implementing Cloneable", "By using the process keyword", "By calling System.thread()",
         "A", "Threads are defined either by extending Thread and overriding run(), or implementing Runnable."),

        ("Which method must be overridden to define the execution code for a thread in Java?",
         "start()", "run()", "execute()", "init()",
         "B", "The `run()` method contains the code executed by the thread upon starting."),

        ("What happens if you invoke `thread.run()` directly instead of `thread.start()`?",
         "A new thread is spawned normally", "The run() method executes synchronously within the current calling thread with no new thread created", "Throws IllegalThreadStateException", "The JVM crashes",
         "B", "Calling run() directly is just a regular method call in the current thread; start() is required to spawn a new OS thread."),

        ("Which method causes the currently executing thread to temporarily pause execution for a specified duration in milliseconds?",
         "Thread.sleep(millis)", "Thread.wait()", "Thread.yield()", "Thread.stop()",
         "A", "Thread.sleep() pauses the active thread without releasing object monitors/locks."),

        ("Which method allows one thread to wait until another specified thread finishes its execution?",
         "thread.wait()", "thread.join()", "thread.sleep()", "thread.notify()",
         "B", "Calling `t1.join()` pauses the calling thread until thread `t1` terminates."),

        ("What does the `synchronized` keyword prevent in multi-threaded Java applications?",
         "Compiler syntax errors", "Data races and concurrent state corruption by restricting access to a critical section to one thread at a time", "Stack overflows", "Deadlocks entirely",
         "B", "Synchronization enforces mutual exclusion on an object monitor, ensuring thread-safe access to critical sections."),

        ("Which methods are used for inter-thread communication in Java and belong to java.lang.Object?",
         "sleep(), join(), and yield()", "wait(), notify(), and notifyAll()", "start(), run(), and stop()", "lock(), unlock(), and signal()",
         "B", "wait(), notify(), and notifyAll() belong to Object and must be invoked from within a synchronized context."),

        ("What happens if a thread invokes `wait()` or `notify()` on an object without holding that object's monitor lock?",
         "Deadlock occurs", "IllegalMonitorStateException is thrown at runtime", "The thread terminates silently", "The JVM halts",
         "B", "Invoking wait/notify outside a synchronized block throws IllegalMonitorStateException."),

        ("What is a Daemon thread in Java?",
         "A high-priority thread that never stops", "A background service thread (e.g., Garbage Collector) that does not prevent the JVM from exiting when all user threads finish", "A thread that accesses hardware directly", "A thread with no run() method",
         "B", "Daemon threads provide background services; the JVM halts automatically when all non-daemon user threads terminate."),

        ("What is the valid priority range for threads in Java?",
         "0 to 100", "1 (MIN_PRIORITY) to 10 (MAX_PRIORITY) with 5 being NORM_PRIORITY", "-1 to +1", "1 to 256",
         "B", "Thread priorities range from Thread.MIN_PRIORITY (1) to Thread.MAX_PRIORITY (10), defaulting to 5."),

        # 7. Java I/O Streams, Applets & Event Handling (86-93)
        ("What is the fundamental difference between Byte Streams and Character Streams in Java I/O?",
         "Byte streams process 8-bit raw bytes; Character streams process 16-bit Unicode characters", "Byte streams are for text; Character streams are for images", "Character streams do not use buffers", "Byte streams cannot read files",
         "A", "InputStream/OutputStream handle 8-bit bytes; Reader/Writer handle 16-bit Unicode characters."),

        ("Which classes form the root abstractions for Character-oriented I/O in java.io?",
         "InputStream and OutputStream", "Reader and Writer", "FileInputStream and FileOutputStream", "Scanner and Formatter",
         "B", "Reader and Writer are the abstract base classes for 16-bit character streaming."),

        ("Which class in java.io is used to wrap an underlying Reader and provide efficient buffered reading along with `readLine()`?",
         "FileReader", "BufferedReader", "DataInputStream", "CharArrayReader",
         "B", "BufferedReader buffers characters for performance and provides readLine() for text reading."),

        ("What marker interface must a class implement to enable object serialization in Java?",
         "java.io.Cloneable", "java.io.Serializable", "java.io.Readable", "java.lang.Runnable",
         "B", "java.io.Serializable is an empty marker interface that authorizes the JVM to serialize instances."),

        ("Which keyword prevents a specific instance variable from being serialized during object serialization?",
         "volatile", "transient", "native", "static",
         "B", "The `transient` keyword tells ObjectOutputStream to skip that field during serialization."),

        ("What is the correct execution lifecycle order of a standard Java Applet?",
         "init() -> start() -> paint() -> stop() -> destroy()", "start() -> init() -> paint() -> stop()", "init() -> paint() -> destroy()", "paint() -> start() -> stop()",
         "A", "The Applet lifecycle proceeds: init() on load, start() when active, paint() to render, stop() on exit, and destroy() before unloading."),

        ("Which method in an Applet is responsible for rendering graphical text, shapes, and images using a Graphics context?",
         "init()", "paint(Graphics g)", "start()", "render()",
         "B", "paint(Graphics g) draws shapes, text (drawString), and images onto the applet window."),

        ("In the Java Delegation Event Model, an object that generates an event is called an:",
         "Event Listener", "Event Source", "Event Handler", "Event Adapter",
         "B", "An Event Source generates events (e.g. Button click) and delivers them to registered Event Listeners."),

        # 8. Sockets, JDBC, HTML & Dynamic Web (94-100)
        ("Which class in the `java.net` package is used by a server to listen for and accept incoming TCP client connections?",
         "java.net.Socket", "java.net.ServerSocket", "java.net.DatagramSocket", "java.net.URL",
         "B", "ServerSocket listens on a port and blocks at accept() until a client connects, returning a Socket."),

        ("Which class in `java.net` represents an IP address and provides domain name resolution?",
         "java.net.InetAddress", "java.net.IPConfig", "java.net.DNSClient", "java.net.SocketAddress",
         "A", "InetAddress encapsulates 32-bit/128-bit IP addresses and resolves hostnames via DNS (e.g., InetAddress.getByName())."),

        ("In JDBC, which interface is preferred for executing parameterized SQL queries to prevent SQL Injection and optimize performance?",
         "Statement", "PreparedStatement", "CallableStatement", "DatabaseMetaData",
         "B", "PreparedStatement pre-compiles queries and safely binds parameters, neutralizing SQL injection."),

        ("In JDBC, which method of Statement is used to execute a SQL query that retrieves data (e.g., SELECT)?",
         "executeUpdate()", "executeQuery()", "executeBatch()", "runQuery()",
         "B", "executeQuery() returns a ResultSet containing query rows; executeUpdate() is for INSERT, UPDATE, or DELETE."),

        ("In HTML, which attribute of the `<a>` tag specifies the target hyperlink URL destination?",
         "src", "href", "link", "url",
         "B", "The `href` (hypertext reference) attribute dictates the destination web page address."),

        ("Which HTML form element creates a drop-down selection list?",
         "<input type=\"dropdown\">", "<select> with nested <option> tags", "<list>", "<dropdown>",
         "B", "A `<select>` tag containing `<option>` elements generates a standard drop-down menu."),

        ("What is the primary difference between HTTP GET and POST methods in web forms?",
         "GET encrypts data; POST does not", "GET appends form data to the URL query string; POST sends data in the HTTP request message body", "GET can send binary files; POST cannot", "POST has a 256-character length limit",
         "B", "GET sends parameters visible in the URL bar (limited length, cacheable); POST carries data invisibly in the request body.")
    ]

    questions = []
    for idx, item in enumerate(raw):
        qid = f"bca-java-q{idx+1:03d}"
        diff = "Easy" if idx < 30 else ("Moderate" if idx < 75 else "Hard")
        topic_name = "JVM & Basics" if idx < 15 else ("Syntax, Strings & Arrays" if idx < 30 else ("OOP & Inheritance" if idx < 50 else ("Packages & Wrappers" if idx < 65 else ("Exception Handling" if idx < 75 else ("Multithreading" if idx < 85 else "I/O, Applets & Web")))))
        topic_id = f"top-java-{(idx // 20) + 1}"
        questions.append({
            "id": qid,
            "order": idx + 1,
            "questionText": item[0],
            "questionType": "MCQ",
            "difficulty": diff,
            "subjectId": "sub-bca-502",
            "subjectName": "Java & Webpage Design (BCA-502)",
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
    qs = get_java_questions()
    print(f"Loaded {len(qs)} Java questions.")
