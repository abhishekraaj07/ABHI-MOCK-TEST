# scripts/bca_data_networks.py
# 100 High-Yield Questions for Computer Networks (BCA-503) from CCSU Syllabus & Solved PYQs

def get_networks_questions():
    raw = [
        # 1. Network Fundamentals, Topologies & Media (1-15)
        ("Which network topology connects every computer to a central device such as a hub or switch?",
         "Ring Topology", "Star Topology", "Bus Topology", "Mesh Topology",
         "B", "In Star topology, every node connects via dedicated point-to-point links to a central hub/switch."),

        ("In a Fully Connected Mesh topology having 'n' devices, how many physical duplex links are required?",
         "n", "n(n - 1) / 2", "n - 1", "2n",
         "B", "A full mesh network requires n(n - 1) / 2 physical bidirectional links to connect all node pairs."),

        ("Which physical transmission medium uses light pulses to transmit data at very high speeds with zero EMI?",
         "Shielded Twisted Pair (STP)", "Coaxial Cable", "Optical Fiber Cable", "Unshielded Twisted Pair (UTP)",
         "C", "Fiber optic cables carry data as pulses of light guided through silica glass fibers, unaffected by electromagnetic interference."),

        ("What physical phenomenon governs the transmission of light pulses inside an optical fiber core?",
         "Refraction", "Diffraction", "Total Internal Reflection", "Polarization",
         "C", "Total Internal Reflection occurs when light strikes the core-cladding boundary at an angle greater than the critical angle."),

        ("Which type of switching dedicates a physical communication path between sender and receiver for the entire session?",
         "Packet Switching", "Circuit Switching", "Message Switching", "Virtual Circuit Switching",
         "B", "Circuit switching (used in traditional telephony) reserves dedicated end-to-end bandwidth before data flows."),

        ("What is the primary advantage of Packet Switching over Circuit Switching?",
         "Guaranteed fixed transmission delay", "Dynamic statistical multiplexing and high link utilization efficiency", "No header overhead required", "Eliminates need for routing tables",
         "B", "Packet switching dynamically shares bandwidth among active nodes, utilizing transmission capacity far more efficiently."),

        ("Which network category covers a small geographical area such as a single room, lab, or office building?",
         "Wide Area Network (WAN)", "Metropolitan Area Network (MAN)", "Local Area Network (LAN)", "Personal Area Network (PAN)",
         "C", "LANs operate across bounded geographic areas (homes, offices) typically spanning less than a few kilometers."),

        ("In a Bus topology, what critical component must be placed at both ends of the backbone coaxial cable to absorb reflections?",
         "Repeater", "Terminator", "Bridge", "Amplifier",
         "B", "Terminators match impedance at the cable extremities, absorbing signals to eliminate signal bounce/reflection."),

        ("Attenuation in computer networking refers to:",
         "Increase in packet transmission speed", "Loss of signal strength and energy as a wave propagates over physical distance", "Packet loss due to buffer overflow", "Network collisions",
         "B", "Attenuation is the gradual decay of signal amplitude over transmission distance, compensated by amplifiers/repeaters."),

        ("What is the theoretical maximum channel capacity of a noiseless channel according to Nyquist theorem?",
         "C = B log2(1 + S/N)", "C = 2B log2(M)", "C = B / M", "C = 2B / log2(M)",
         "B", "Nyquist formula C = 2B log2(M) gives maximum bit rate for bandwidth B and discrete signal levels M in noiseless media."),

        ("What does Shannon's Channel Capacity theorem define for a noisy channel?",
         "Maximum channel speed without noise", "Theoretical maximum error-free data rate: C = B log2(1 + SNR)", "Maximum cable length", "Number of repeaters needed",
         "B", "Shannon's capacity formula establishes the upper transmission bound in the presence of Gaussian thermal noise."),

        ("Which unguided (wireless) transmission band is used for television remotes and short-range line-of-sight devices?",
         "Radio waves", "Microwaves", "Infrared waves", "Ultraviolet",
         "C", "Infrared signals cannot penetrate solid walls and are used for secure, short-range indoor devices and remotes."),

        ("Which transmission impairment is caused by the unwanted electrical coupling between adjacent wire pairs in a cable?",
         "Attenuation", "Crosstalk", "Thermal Noise", "Dispersion",
         "B", "Crosstalk happens when electromagnetic radiation from one twisted pair leaks into an adjacent wire pair."),

        ("A communication mode where transmission can occur in both directions simultaneously is called:",
         "Simplex", "Half-Duplex", "Full-Duplex", "Multiplex",
         "C", "Full-Duplex (e.g., standard telephone or switched Ethernet) supports concurrent bidirectional transmission."),

        ("A walkie-talkie where users take turns transmitting one at a time is an example of:",
         "Simplex", "Half-Duplex", "Full-Duplex", "Multi-Drop",
         "B", "Half-Duplex allows bidirectional communication, but only one party may transmit on the shared frequency at a given moment."),

        # 2. OSI Model & TCP/IP Architecture (16-30)
        ("How many layers are specified in the standard ISO-OSI Reference Model?",
         "4", "5", "7", "8",
         "C", "The OSI model specifies 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application."),

        ("What is the Protocol Data Unit (PDU) called at the Data Link Layer?",
         "Bit", "Frame", "Packet (Datagram)", "Segment",
         "B", "Data Link PDU is a Frame; Physical is Bit; Network is Packet; Transport is Segment."),

        ("What is the Protocol Data Unit (PDU) called at the Network Layer?",
         "Frame", "Packet (or Datagram)", "Segment", "Message",
         "B", "The Network layer encapsulates transport segments into Packets / Datagrams with logical IP addresses."),

        ("What is the Protocol Data Unit (PDU) called at the Transport Layer?",
         "Bit", "Frame", "Segment (or UDP Datagram)", "Packet",
         "C", "The Transport layer encapsulates application messages into Segments (TCP) or User Datagrams (UDP)."),

        ("Which OSI layer is responsible for end-to-end process-to-process delivery, flow control, and port addressing?",
         "Network Layer", "Transport Layer", "Session Layer", "Data Link Layer",
         "B", "The Transport layer (Layer 4) provides process-to-process communication using source and destination port numbers."),

        ("Which OSI layer performs cryptographic encryption/decryption, data compression, and character set translation?",
         "Application Layer", "Presentation Layer", "Session Layer", "Transport Layer",
         "B", "The Presentation layer (Layer 6) handles abstract data formatting, encoding (ASCII/Unicode), and SSL/TLS encryption."),

        ("Which OSI layer establishes, manages, synchronizes, and terminates dialog sessions between cooperating applications?",
         "Transport Layer", "Session Layer", "Presentation Layer", "Network Layer",
         "B", "The Session layer (Layer 5) maintains session tokens, dialog control (simplex/half/full duplex), and synchronization checkpoints."),

        ("Which OSI layer is responsible for routing packets across interconnected disparate networks using logical addresses?",
         "Data Link Layer", "Network Layer", "Transport Layer", "Physical Layer",
         "B", "The Network layer determines optimal paths across hops using IP routing protocols."),

        ("How many layers are defined in the original TCP/IP protocol suite?",
         "7", "4 (Network Access, Internet, Host-to-Host Transport, Application)", "3", "6",
         "B", "TCP/IP architecture defines 4 primary layers: Network Interface, Internet, Transport, and Application."),

        ("Which device operates at the Physical layer (Layer 1) to regenerate and retransmit degraded electrical signals?",
         "Router", "Repeater (or Hub)", "Bridge", "Gateway",
         "B", "Repeaters and hubs operate at Layer 1, regenerating electrical bit streams without inspecting headers."),

        ("A standard Layer 2 Network Switch makes packet forwarding decisions based on:",
         "IP Addresses", "MAC (Hardware) Addresses", "Port Numbers", "URL strings",
         "B", "Layer 2 switches maintain MAC Address Tables (CAM tables) to forward frames to specific physical ports."),

        ("A Network Router operates at which layer of the OSI model?",
         "Data Link Layer (Layer 2)", "Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Session Layer (Layer 5)",
         "B", "Routers operate at Layer 3 (Network Layer) and inspect IP headers to make path routing decisions."),

        ("Which network device connects two distinct network architectures operating on completely different protocol suites?",
         "Bridge", "Hub", "Gateway", "Switch",
         "C", "A Gateway translates protocols across all 7 OSI layers, bridging incompatible networks."),

        ("What is the size of an IEEE 802 standard MAC (Ethernet) address?",
         "32 bits", "48 bits (6 bytes)", "64 bits", "128 bits",
         "B", "Ethernet MAC addresses are 48-bit hardware identifiers represented as 12 hexadecimal digits (e.g., 00:1A:2B:3C:4D:5E)."),

        ("What are the first 3 bytes (24 bits) of an Ethernet MAC address known as?",
         "Host ID", "Organizationally Unique Identifier (OUI)", "Network ID", "Checksum",
         "B", "The first 24 bits are the IEEE-assigned OUI identifying the hardware manufacturer / vendor."),

        # 3. Data Link Layer, Framing & Flow Control (31-45)
        ("In HDLC framing, what specific bit pattern is used as the start and end flag sequence?",
         "11111111", "01111110 (0x7E)", "00000000", "10101010",
         "B", "HDLC flags use 01111110 (six consecutive ones bounded by zeroes) to delimit frame boundaries."),

        ("What technique does HDLC use to prevent the flag pattern (01111110) from accidentally appearing in payload data?",
         "Byte Stuffing", "Bit Stuffing (inserting a 0 after five consecutive 1s)", "Hamming Encoding", "Scrambling",
         "B", "Bit stuffing automatically inserts a '0' bit after any sequence of five consecutive '1' bits in the payload."),

        ("In Byte Stuffing (Character-Oriented Framing), which special escape character is stuffed before payload delimiter bytes?",
         "ESC", "DLE (Data Link Escape)", "SYN", "ETX",
         "B", "DLE (Data Link Escape) is stuffed before occurrences of DLE STX or DLE ETX inside data payload."),

        ("What is 'Piggybacking' in data link layer protocols?",
         "Sending duplicate frames for redundancy", "Delaying an acknowledgment (ACK) to attach it to the header of the next outgoing data frame", "Compressing multiple packets into one frame", "Stealing unused bandwidth",
         "B", "Piggybacking appends acknowledgment numbers to outgoing reverse data frames, conserving bandwidth."),

        ("In Stop-and-Wait ARQ, what happens if an acknowledgment (ACK) frame is lost in transit?",
         "The sender waits infinitely", "The sender's retransmission timer expires and the data frame is automatically retransmitted", "The receiver crashes", "The connection is immediately terminated",
         "B", "Timeout expiration triggers retransmission of the unacknowledged frame."),

        ("In a Go-Back-N ARQ protocol with an m-bit sequence number, what is the maximum permissible sender window size?",
         "2^m", "2^m - 1", "2^(m - 1)", "m",
         "B", "To avoid ambiguity between new frames and retransmissions, Go-Back-N sender window size must not exceed 2^m - 1."),

        ("What is the receiver window size in Go-Back-N ARQ?",
         "1", "2^m - 1", "2^(m - 1)", "Infinite",
         "A", "Go-Back-N receivers accept frames strictly in sequence, maintaining a receive window size of 1 and discarding out-of-order frames."),

        ("In Selective Repeat ARQ with an m-bit sequence number, what is the maximum sender and receiver window size?",
         "2^m - 1", "2^(m - 1)", "2^m", "1",
         "B", "In Selective Repeat, both sender and receiver windows are equal, with maximum size 2^(m - 1) to prevent sequence overlap."),

        ("Which ARQ flow control protocol retransmits ONLY the specific damaged or lost frame rather than subsequent frames?",
         "Stop-and-Wait", "Go-Back-N", "Selective Repeat", "Sliding Window",
         "C", "Selective Repeat buffers out-of-order frames and requests retransmission of only the specific missing sequence number."),

        ("In HDLC, which frame type carries actual user data and piggybacked acknowledgment sequence numbers?",
         "Information Frame (I-Frame)", "Supervisory Frame (S-Frame)", "Unnumbered Frame (U-Frame)", "Management Frame",
         "A", "I-Frames carry payload data along with N(S) send sequence and N(R) receive sequence acknowledgment numbers."),

        ("In HDLC, Supervisory Frames (S-Frames) are primarily utilized for:",
         "Carrying user files", "Flow control and error control (ACK, NAK, Receive Ready RR, Receive Not Ready RNR)", "Link connection initialization", "Power management",
         "B", "S-Frames contain control commands for flow/error management without carrying payload data."),

        ("In HDLC, Unnumbered Frames (U-Frames) are utilized for:",
         "Carrying email attachments", "Link setup, disconnect, mode setting (SABM, DISC), and reporting unrecoverable errors", "Carrying video streams", "Encryption key rotation",
         "B", "U-Frames manage link initialization and teardown (e.g. Set Asynchronous Balanced Mode SABM)."),

        ("What is the efficiency of Stop-and-Wait protocol when propagation delay (Tp) is significantly larger than transmission time (Tt)?",
         "Close to 100%", "Extremely low: Efficiency = 1 / (1 + 2a) where a = Tp / Tt", "50%", "Independent of propagation delay",
         "B", "High latency satellite or long-haul links make Stop-and-Wait highly inefficient because sender idles waiting for ACKs."),

        ("What does the parameter 'a' represent in data communication efficiency formulas?",
         "Attenuation per km", "Ratio of propagation delay to transmission delay (Tp / Tt)", "Bandwidth delay product", "Signal to noise ratio",
         "B", "The parameter a = Tp / Tt measures how many packet lengths fill the pipe during round-trip propagation."),

        ("Which data link layer protocol is universally used over direct point-to-point serial links and dial-up/DSL internet connections?",
         "Ethernet", "Point-to-Point Protocol (PPP)", "Token Ring", "FDDI",
         "B", "PPP encapsulates packets over serial links and handles authentication (PAP/CHAP) and IP address negotiation.")
    ]

    # Add Error Control, MAC protocols, IPv4/IPv6, Routing, Transport & Security (46-100)
    raw.extend([
        # 4. Error Detection & Correction (46-55)
        ("In Cyclic Redundancy Check (CRC), if the generator polynomial is of degree 'r', how many check bits (zeroes) are appended to the data bits before division?",
         "r", "r + 1", "r - 1", "2r",
         "A", "A generator polynomial of degree r requires appending exactly r zeroes to data before modulo-2 polynomial division."),

        ("Modulo-2 arithmetic used in CRC calculations is mathematically equivalent to which bitwise operation?",
         "AND", "OR", "XOR (Exclusive OR)", "NOT",
         "C", "Modulo-2 addition and subtraction are identical and equivalent to the bitwise XOR operation without carries."),

        ("To detect up to 'd' single-bit errors in any transmission, the minimum Hamming distance of the code must be:",
         "d", "d + 1", "2d + 1", "2d",
         "B", "To detect d single-bit errors, the code words must have a minimum Hamming distance of d + 1."),

        ("To correct up to 't' single-bit errors in any transmission, the minimum Hamming distance of the code must be:",
         "t + 1", "2t", "2t + 1", "t^2",
         "C", "To guarantee correction of t errors, spheres of radius t around valid codewords must not overlap: d_min >= 2t + 1."),

        ("What is the Hamming distance between the two codewords 1011101 and 1001001?",
         "1", "2", "3", "4",
         "B", "Hamming distance is the count of differing bit positions: positions 3 and 5 differ, so distance is 2."),

        ("How does the standard Internet Checksum algorithm verify data integrity at the receiver?",
         "Performs polynomial division", "Sums 16-bit words using 1's complement arithmetic; valid sum of data plus checksum should be all 1s (or 0)", "Counts total bits transmitted", "Checks parity bits",
         "B", "The 16-bit 1's complement sum of the packet header including checksum must equal 0xFFFF (all 1s)."),

        ("Which error detection scheme is capable of detecting all odd-numbered bit errors?",
         "Simple Even Parity check", "CRC-32 only", "Two-dimensional parity only", "Hamming code only",
         "A", "Even parity flips its parity bit on any odd number of bit errors, guaranteeing detection of all odd-count flips."),

        ("In a (7, 4) Hamming code, how many data bits and parity (check) bits are present in each codeword?",
         "7 data, 4 parity", "4 data, 3 parity", "5 data, 2 parity", "3 data, 4 parity",
         "B", "Total length n = 7, message bits k = 4, and parity check bits r = n - k = 3."),

        ("What mathematical inequality determines the required number of parity bits 'r' for 'm' data bits in Hamming code?",
         "2^r >= m + r + 1", "2^r >= m", "r^2 >= m + 1", "2^m >= r + 1",
         "A", "Hamming rule: 2^r must provide enough distinct bit combinations to point to each bit position or indicate no error: 2^r >= m + r + 1."),

        ("Why is CRC widely used in hardware data links (Ethernet, Wi-Fi) over simple checksums?",
         "It uses software loops", "It detects burst errors of length up to polynomial degree with high probability using simple shift-register hardware", "It requires no CPU", "It provides encryption",
         "B", "CRC polynomials detect burst errors up to r bits with 100% certainty and are implemented in linear feedback shift registers."),

        # 5. MAC Protocols & Local Area Networks (56-65)
        ("What is the maximum theoretical channel throughput of Pure ALOHA?",
         "100%", "36.8% (1 / e)", "18.4% (1 / 2e)", "50%",
         "C", "Pure ALOHA has a vulnerable period of 2 * T_frame, yielding maximum throughput S = G * e^(-2G) = 1/(2e) approx 18.4% at G=0.5."),

        ("What is the maximum theoretical channel throughput of Slotted ALOHA?",
         "18.4%", "36.8% (1 / e)", "50%", "73.6%",
         "B", "By restricting transmissions to discrete time slot boundaries, vulnerable time is halved, doubling throughput to 1/e approx 36.8%."),

        ("In CSMA/CD (Carrier Sense Multiple Access with Collision Detection), what does a station do upon detecting a collision?",
         "Continues transmitting normally", "Stops transmitting data immediately and broadcasts a 32-bit jam signal across the wire", "Disconnects from the hub", "Switches to wireless",
         "B", "The transmitting station immediately halts transmission and sends a jam signal to ensure all nodes register the collision."),

        ("What algorithm is used in CSMA/CD to determine how long a station should wait before retransmitting after a collision?",
         "Round Robin", "Binary Exponential Backoff Algorithm", "Shortest Job First", "Dijkstra Algorithm",
         "B", "After collision 'k', stations wait a random number of slot times between 0 and 2^(min(k, 10)) - 1."),

        ("In an Ethernet network, what is the fundamental relationship between minimum frame size, bandwidth, and propagation delay?",
         "Transmission time (Tt) must be greater than or equal to twice the round-trip propagation delay (2 * Tp)", "Tt must be equal to Tp", "Frame size can be arbitrary", "Tp must be 10 times Tt",
         "A", "To guarantee a sender detects collisions before completing transmission, T_frame >= 2 * T_prop."),

        ("What is the standard minimum frame size for IEEE 802.3 10 Mbps Ethernet?",
         "32 bytes", "64 bytes (512 bits)", "128 bytes", "1500 bytes",
         "B", "64 bytes is the standard minimum Ethernet frame size, ensuring collision detection across maximum cable segments."),

        ("What is the maximum payload size (MTU) of a standard Ethernet frame?",
         "512 bytes", "1024 bytes", "1500 bytes", "4096 bytes",
         "C", "Standard Ethernet frames carry a Maximum Transmission Unit (MTU) of 1500 bytes of IP payload."),

        ("Why is CSMA/CA (Collision Avoidance) used in Wi-Fi (IEEE 802.11) instead of CSMA/CD?",
         "Wi-Fi chips are too slow", "Wireless transceivers cannot transmit and listen concurrently on the same channel to detect collisions", "Collisions never happen in wireless", "Wi-Fi uses fiber",
         "B", "Wireless transmission energy dwarfs received signal energy, blinding the radio from detecting concurrent collisions while transmitting."),

        ("Which handshaking mechanism in CSMA/CA solves the 'Hidden Terminal Problem' in wireless networks?",
         "SYN and ACK", "RTS (Request to Send) and CTS (Clear to Send)", "PING and PONG", "ARP and RARP",
         "B", "RTS/CTS frames reserve channel access and alert hidden nodes via the Network Allocation Vector (NAV)."),

        ("Which IEEE standard specifies Token Ring networks?",
         "IEEE 802.3", "IEEE 802.5", "IEEE 802.11", "IEEE 802.15",
         "B", "IEEE 802.5 specifies Token Ring; 802.3 is Ethernet, 802.11 is Wi-Fi, and 802.15 is Bluetooth/Zigbee."),

        # 6. Network Layer & IPv4/IPv6 Addressing (66-75)
        ("What is the total bit length of an IPv4 address?",
         "16 bits", "32 bits (4 octets)", "64 bits", "128 bits",
         "B", "IPv4 addresses consist of 32 bits organized as 4 decimal octets separated by dots (e.g., 192.168.1.1)."),

        ("What is the first octet range for Class A IPv4 addresses in classful addressing?",
         "1 to 126", "128 to 191", "192 to 223", "224 to 239",
         "A", "Class A addresses begin with leading bit '0' and span first octet values 1 to 126 (127 is reserved for loopback)."),

        ("What is the default subnet mask for a Class B IPv4 network?",
         "255.0.0.0", "255.255.0.0 (/16)", "255.255.255.0 (/24)", "255.255.255.255",
         "B", "Class B reserves 16 bits for Network ID and 16 bits for Host ID: default mask 255.255.0.0."),

        ("Which IPv4 address class is specifically reserved for Multicast transmission?",
         "Class B", "Class C", "Class D (224.0.0.0 to 239.255.255.255)", "Class E",
         "C", "Class D addresses (prefix 1110, range 224-239) are designated for one-to-many multicast groups."),

        ("What is the purpose of the IPv4 loopback address 127.0.0.1 (localhost)?",
         "To test external internet connections", "To test the local TCP/IP protocol stack and internal inter-process communication without sending packets to the wire", "To broadcast to all LAN devices", "To assign router IP",
         "B", "127.0.0.1 loops packets back within the local OS kernel to test network software functionality."),

        ("What is the size of an IPv6 address in bits?",
         "32 bits", "64 bits", "128 bits (16 octets)", "256 bits",
         "C", "IPv6 uses 128-bit addresses represented as 8 groups of 4 hexadecimal digits separated by colons."),

        ("Which protocol resolves a known logical IP address to a physical MAC address on a local network?",
         "DNS", "ARP (Address Resolution Protocol)", "RARP", "DHCP",
         "B", "ARP broadcasts an 'ARP Request' on the local LAN to discover the hardware MAC address matching a destination IP."),

        ("Which protocol allows diskless workstations to obtain their IP address from a server upon booting?",
         "ARP", "RARP (Reverse ARP) / BOOTP", "DNS", "ICMP",
         "B", "RARP queries a centralized server to retrieve the IP address corresponding to a known physical MAC address."),

        ("What protocol is used by network diagnostic tools like `ping` and `traceroute` to report errors and echo packets?",
         "IGMP", "ICMP (Internet Control Message Protocol)", "SNMP", "SMTP",
         "B", "ICMP carries operational status messages, Echo Request/Reply (ping), and Time Exceeded (traceroute) notifications."),

        ("What is the primary role of NAT (Network Address Translation) in modern IP networking?",
         "Encrypts IP packet headers", "Maps multiple private non-routable IP addresses to one or more globally routable public IP addresses", "Assigns domain names", "Compresses audio",
         "B", "NAT conserves IPv4 addresses by translating private RFC 1918 addresses into shared public IPs at the border router."),

        # 7. Routing Algorithms & Congestion Control (76-85)
        ("Dijkstra's shortest path routing algorithm is categorized as which type of routing algorithm?",
         "Distance Vector Routing", "Link State Routing", "Flooding", "Random Walk",
         "B", "Dijkstra computes shortest paths on a globally synchronized topological link-state database (used in OSPF)."),

        ("Distance Vector routing protocols (such as RIP) rely on which mathematical algorithm?",
         "Dijkstra Algorithm", "Bellman-Ford Algorithm", "Kruskal Algorithm", "Prim Algorithm",
         "B", "Distance vector routing iteratively updates neighbour vectors using Bellman-Ford equation: D_x(y) = min_v { c(x,v) + D_v(y) }."),

        ("What severe routing pathology occurs in Distance Vector protocols when a link fails, causing routers to slowly increment hop counts?",
         "Deadlock", "Count-to-Infinity Problem", "Routing Loop only", "Broadcast Storm",
         "B", "Count-to-infinity occurs when two or more routers propagate stale metrics after link failure, slowly counting up to infinity."),

        ("Which technique helps mitigate the Count-to-Infinity problem by preventing a router from advertising a route back out the interface it learned it from?",
         "Poison Reverse", "Split Horizon", "Flooding", "Hold-down Timer",
         "B", "Split Horizon dictates that route information is never broadcast back to the node from which it was received."),

        ("What is the maximum hop count allowed by the Routing Information Protocol (RIP) before a destination is declared unreachable?",
         "7", "15 (16 denotes infinity)", "30", "255",
         "B", "RIP limits path length to 15 hops; 16 hops signifies an unreachable network."),

        ("Which Interior Gateway Protocol (IGP) is an open-standard Link-State protocol that organizes networks into hierarchical Areas?",
         "RIP", "BGP", "OSPF (Open Shortest Path First)", "EGP",
         "C", "OSPF uses link-state advertisements, Dijkstra calculations, and hierarchical Area 0 (Backbone Area)."),

        ("Which exterior routing protocol is the standard inter-autonomous system (AS) routing protocol of the global Internet?",
         "OSPF", "IS-IS", "BGP (Border Gateway Protocol)", "RIPv2",
         "C", "BGP-4 is a path-vector exterior gateway protocol that interconnects distinct Autonomous Systems across the Internet."),

        ("In traffic shaping, which algorithm transmits packets at an absolutely constant, smooth output rate regardless of burstiness?",
         "Token Bucket Algorithm", "Leaky Bucket Algorithm", "Random Early Detection (RED)", "FIFO",
         "B", "A Leaky Bucket drains packets at an invariant, fixed rate, smoothing out bursts completely."),

        ("How does a Token Bucket traffic shaper differ from a Leaky Bucket shaper?",
         "It drops packets constantly", "It allows regulated bursty traffic transmissions up to the accumulated token limit", "It only works on UDP", "It has no buffer",
         "B", "Token buckets permit bursts of traffic when sufficient tokens have accumulated in the bucket."),

        ("What happens in TCP when a router drops a packet due to internal buffer queue exhaustion?",
         "Receiver terminates connection", "Sender infers network congestion upon timeout or 3 duplicate ACKs and throttles its congestion window", "Router sends an RST packet", "TCP ignores the loss",
         "B", "TCP treats packet loss as an implicit signal of network congestion and reduces its transmission rate (AIMD)."),

        # 8. Transport Layer & Protocols (86-93)
        ("What are the core differences between TCP and UDP?",
         "TCP is connectionless and unreliable; UDP is connection-oriented", "TCP is connection-oriented, reliable, and byte-stream; UDP is connectionless, unreliable, and datagram-oriented", "TCP is faster than UDP", "UDP provides flow control",
         "B", "TCP guarantees in-order, error-free delivery via acknowledgments; UDP is lightweight with minimal header overhead and no guarantees."),

        ("How many packets are exchanged in a standard TCP Connection Establishment Handshake?",
         "2 packets", "3 packets (SYN -> SYN-ACK -> ACK)", "4 packets", "1 packet",
         "B", "The 3-way handshake synchronizes sequence numbers: Client sends SYN, Server replies SYN-ACK, Client sends ACK."),

        ("How many segments are typically exchanged to gracefully close a TCP connection?",
         "2 segments", "3 segments", "4 segments (FIN -> ACK -> FIN -> ACK)", "1 segment",
         "C", "TCP connection teardown uses a 4-way handshake: each half of the full-duplex link is closed independently with FIN/ACK."),

        ("In TCP congestion control, what algorithm exponentially doubles the congestion window (cwnd) every Round Trip Time (RTT)?",
         "Congestion Avoidance", "Slow Start", "Fast Recovery", "AIMD",
         "B", "Slow Start begins with cwnd = 1 MSS and increments cwnd by 1 for each received ACK, effectively doubling cwnd each RTT."),

        ("What is the standard port number for the HTTP web protocol?",
         "21", "25", "80", "443",
         "C", "HTTP operates on well-known TCP port 80; HTTPS operates on encrypted port 443."),

        ("What is the standard port number for DNS (Domain Name System) queries?",
         "23", "53 (primarily over UDP)", "67", "110",
         "B", "DNS uses port 53 over UDP for lightweight queries and over TCP for large zone transfers."),

        ("What is the standard port number used by SMTP to send outbound emails between mail servers?",
         "20", "22", "25", "110",
         "C", "SMTP runs over TCP port 25 for inter-server mail transfer (client submission uses 587)."),

        ("Which transport protocol is preferred for real-time applications like VoIP, online gaming, and live video streaming?",
         "TCP", "UDP", "FTP", "SNMP",
         "B", "UDP avoids head-of-line blocking and retransmission delays, making it ideal for low-latency real-time media."),

        # 9. Application Protocols & Network Security (94-100)
        ("What is the primary role of the Domain Name System (DNS)?",
         "Assigns IP addresses dynamically to LAN clients", "Translates human-readable domain names (e.g. example.com) into machine-routable IP addresses", "Encrypts web traffic", "Filters malicious URLs",
         "B", "DNS serves as the phonebook of the Internet, mapping hostname strings to 32-bit/128-bit IP addresses."),

        ("Which protocol is used by email clients to retrieve messages from a mail server while keeping emails synchronized on the server across multiple devices?",
         "SMTP", "POP3", "IMAP (Internet Message Access Protocol)", "HTTP",
         "C", "IMAP synchronizes mailbox state across clients; POP3 typically downloads and deletes emails locally."),

        ("In Symmetric-Key Cryptography (e.g. AES, DES):",
         "Two different keys are used for encryption and decryption", "The identical secret key is shared and used for both encryption and decryption", "No keys are needed", "Private key is public",
         "B", "Symmetric cryptography uses one shared secret key for both encryption and decryption operations."),

        ("In Asymmetric (Public-Key) Cryptography (e.g. RSA):",
         "The public key is secret", "Data encrypted with the recipient's Public Key can only be decrypted with that recipient's Private Key", "Same key encrypts and decrypts", "No mathematical relationship exists between keys",
         "B", "Public key encryption allows anyone to encrypt messages, but only the holder of the matching private key can decrypt them."),

        ("How does a Digital Signature ensure authenticity and non-repudiation in electronic messages?",
         "Sender encrypts the message with recipient's public key", "Sender encrypts the cryptographic hash of the message with the sender's Private Key", "Sender sends an unencrypted password", "A notary signs the packet",
         "B", "Encrypting a message hash with one's private key proves origin authenticity and ensures the sender cannot deny sending it."),

        ("What is the primary function of a Network Firewall?",
         "Speed up internet bandwidth", "Monitor, filter, and control incoming and outgoing network traffic based on predetermined security rules", "Assign IP addresses automatically", "Clean hard drive viruses",
         "B", "A firewall enforces security perimeter policies, permitting or blocking traffic flows based on IP, port, or packet inspection."),

        ("What is the main difference between a Packet-Filtering Firewall and a Stateful Inspection Firewall?",
         "Packet filtering is faster but inspects packets in isolation without connection state; Stateful firewall tracks TCP connection state and context", "Stateful firewall cannot filter IP addresses", "Packet filtering operates at Application layer", "They are identical",
         "A", "Stateful firewalls track TCP handshakes, sequence numbers, and connection states to prevent spoofing attacks.")
    ])

    questions = []
    for idx, item in enumerate(raw):
        qid = f"bca-cn-q{idx+1:03d}"
        diff = "Easy" if idx < 30 else ("Moderate" if idx < 75 else "Hard")
        topic_name = "Topologies & Media" if idx < 15 else ("OSI & TCP/IP Model" if idx < 30 else ("Data Link & Framing" if idx < 45 else ("Error Control" if idx < 55 else ("MAC & LANs" if idx < 65 else ("Network Layer & IP" if idx < 75 else ("Routing & Congestion" if idx < 85 else ("Transport Layer" if idx < 93 else "Application & Security")))))))
        topic_id = f"top-cn-{(idx // 20) + 1}"
        questions.append({
            "id": qid,
            "order": idx + 1,
            "questionText": item[0],
            "questionType": "MCQ",
            "difficulty": diff,
            "subjectId": "sub-bca-503",
            "subjectName": "Computer Networks (BCA-503)",
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
    qs = get_networks_questions()
    print(f"Loaded {len(qs)} Networks questions.")
