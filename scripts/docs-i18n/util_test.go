package main

import (
	"testing"
)

func TestTruncateOutput(t *testing.T) {
	tests := []struct {
		input    string
		maxLen   int
		expected string
	}{
		{"hello", 10, "hello"},
		{"hello", 5, "hello"},
		{"abcdefghij", 10, "abcdefghij"},
		{"abcdefghij", 9, "ab[...]ij"},
		{"abcdefghij", 8, "ab[...]j"},
		{"abcdefghij", 7, "a[...]j"},
		{"abcdefghij", 6, "a[...]"},
		{"abcdefghij", 5, "abcde"},
		{"abcdefghij", 4, "abcd"},
		{"very long string indeed", 15, "very [...]ndeed"},
		{"こんにちは世界", 5, "こんにちは"},
		{"今日もいい天気ですね", 9, "今日[...]すね"},
		{"🍕🍔🍟🌭🍿", 3, "🍕🍔🍟"},
		{"A \U0001F600 B", 5, "A \U0001F600 B"},
		{"A \U0001F600 B", 3, "A 😀"},


	}

	for _, tt := range tests {
		actual := TruncateOutput(tt.input, tt.maxLen)
		if actual != tt.expected {
			t.Errorf("TruncateOutput(%q, %d) = %q; want %q", tt.input, tt.maxLen, actual, tt.expected)
		}
	}
}
