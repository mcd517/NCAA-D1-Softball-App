// Fix for fmt library template issues
#pragma once

#include <string>
#include <type_traits>

// Ensure we get proper char traits specialization before fmt includes it
namespace std {
  template<>
  struct char_traits<unsigned char> {
    using char_type = unsigned char;
    using int_type = int;
    using off_type = streamoff;
    using pos_type = streampos;
    using state_type = mbstate_t;
    
    static void assign(char_type& c1, const char_type& c2) noexcept { c1 = c2; }
    static bool eq(char_type c1, char_type c2) noexcept { return c1 == c2; }
    static bool lt(char_type c1, char_type c2) noexcept { return c1 < c2; }
    
    static int compare(const char_type* s1, const char_type* s2, size_t n) {
      for (size_t i = 0; i < n; ++i) {
        if (lt(s1[i], s2[i])) return -1;
        if (lt(s2[i], s1[i])) return 1;
      }
      return 0;
    }
    
    static size_t length(const char_type* s) {
      const char_type* p = s;
      while (*p) ++p;
      return p - s;
    }
    
    static const char_type* find(const char_type* s, size_t n, const char_type& a) {
      for (size_t i = 0; i < n; ++i) {
        if (eq(s[i], a)) return s + i;
      }
      return nullptr;
    }
    
    static char_type* move(char_type* s1, const char_type* s2, size_t n) {
      if (s1 < s2) {
        for (size_t i = 0; i < n; ++i) assign(s1[i], s2[i]);
      } else if (s1 > s2) {
        for (size_t i = n; i > 0; --i) assign(s1[i-1], s2[i-1]);
      }
      return s1;
    }
    
    static char_type* copy(char_type* s1, const char_type* s2, size_t n) {
      for (size_t i = 0; i < n; ++i) assign(s1[i], s2[i]);
      return s1;
    }
    
    static char_type to_char_type(int_type c) noexcept { return static_cast<char_type>(c); }
    static int_type to_int_type(char_type c) noexcept { return static_cast<int_type>(c); }
    static bool eq_int_type(int_type c1, int_type c2) noexcept { return c1 == c2; }
    static int_type eof() noexcept { return static_cast<int_type>(-1); }
    static int_type not_eof(int_type c) noexcept { return c == eof() ? 0 : c; }
  };
}

// Other forward declarations to resolve template issues
namespace std {
  template<typename T> struct is_empty;
  template<typename T> struct is_arithmetic;
  template<typename T> struct is_convertible;
  template<typename T> struct is_constructible;
  template<typename T> class basic_string;
  template<typename, typename> class basic_stringstream;
  template<typename> class allocator;
  template<typename T> struct is_class;
  template<typename T> struct is_base_of;
  template<typename T, typename U> struct is_same;
  template<bool B, class T = void> struct enable_if;
}
