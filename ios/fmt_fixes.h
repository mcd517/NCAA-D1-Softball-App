// Force use of our fixes for char8_type issues in the fmt library
#pragma once

#ifndef FMT_FIXES_H
#define FMT_FIXES_H

// Include standard library headers
#include <cstddef>     // for size_t
#include <ios>         // for streamoff, streampos
#include <cwchar>      // for mbstate_t
#include <cstring>     // for memcpy, memmove, memcmp

// This file provides minimal fixes for the fmt library to compile on iOS

// Define these flags to disable problematic features
#define FMT_USE_NONTYPE_TEMPLATE_PARAMETERS 0
#define FMT_UNICODE 0 
#define FMT_USE_CONSTEXPR 0

// Forward declarations to avoid namespace conflicts
// Define the char8_type in a non-conflicting way
#ifndef FMT_CHAR8_TYPE_DEFINED
#define FMT_CHAR8_TYPE_DEFINED
namespace fmt_fix {
  using char8_type = unsigned char;
}
#endif

// Full specialization of std::char_traits for our custom char8_type
namespace std {
  template<>
  struct char_traits<fmt_fix::char8_type> {
    using char_type = fmt_fix::char8_type;
    using int_type = int;
    using off_type = streamoff;
    using pos_type = streampos;
    using state_type = mbstate_t;
    
    static void assign(char_type& c1, const char_type& c2) noexcept { c1 = c2; }
    static bool eq(char_type c1, char_type c2) noexcept { return c1 == c2; }
    static bool lt(char_type c1, char_type c2) noexcept { return c1 < c2; }
    
    static int compare(const char_type* s1, const char_type* s2, size_t n) {
      return memcmp(s1, s2, n);
    }
    
    static size_t length(const char_type* s) {
      return char_traits<char>::length(reinterpret_cast<const char*>(s));
    }
    
    static const char_type* find(const char_type* s, size_t n, const char_type& a) {
      for (size_t i = 0; i < n; ++i) {
        if (eq(s[i], a)) return s + i;
      }
      return nullptr;
    }
    
    static char_type* move(char_type* s1, const char_type* s2, size_t n) {
      return static_cast<char_type*>(memmove(s1, s2, n));
    }
    
    static char_type* copy(char_type* s1, const char_type* s2, size_t n) {
      memcpy(s1, s2, n);
      return s1;
    }
    
    static char_type to_char_type(int_type c) noexcept { return static_cast<char_type>(c); }
    static int_type to_int_type(char_type c) noexcept { return static_cast<int_type>(c); }
    static bool eq_int_type(int_type c1, int_type c2) noexcept { return c1 == c2; }
    static int_type eof() noexcept { return static_cast<int_type>(-1); }
    static int_type not_eof(int_type c) noexcept { return c == eof() ? 0 : c; }
  };
}

// Ensure fmt uses our fixed char8_type definition
#ifdef __cpp_char8_t
#undef __cpp_char8_t
#endif

#endif // FMT_FIXES_H
