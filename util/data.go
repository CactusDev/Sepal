package util

import "encoding/json"

// IsJSON Return true or false based on if a byte array is json or not.
func IsJSON(data []byte) bool {
	var message map[string]interface{}
	return json.Unmarshal(data, &message) == nil
}

// StringInSlice - Checks if a string is within the given slice
func StringInSlice(entry string, slice []string) (bool, int) {
	for location, item := range slice {
		if item == entry {
			return true, location
		}
	}
	return false, -1
}
