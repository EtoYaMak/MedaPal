import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { openai } from "../../lib/openai";

interface VoiceAssistantProps {
  isVisible: boolean;
  onClose: () => void;
  onMedicationComplete: (medicationDetails: MedicationDetails) => void;
  theme: 'light' | 'dark';
  colors: any; // You might want to properly type this based on your theme types
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MedicationDetails {
  medication_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  times_per_frequency: number;
  preferred_time: TimeOfDay[];
  remaining_quantity?: string;
  notes?: string;
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "bedtime";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export function VoiceAssistant({
  isVisible,
  onClose,
  onMedicationComplete,
  theme,
  colors,
}: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isVisible && messages.length === 0) {
      handleAIResponse({
        role: "assistant",
        content:
          "Hello! I'm your medication assistant. What medication would you like to add?",
      });
    }
  }, [isVisible]);

  const handleAIResponse = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleSend = async (retryCount = 0) => {
    if (!inputText.trim()) return;

    const userMessage: Message = { role: "user", content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a medical assistant helping users add medications to their tracking system. 
            Collect the following information in a conversational way:
            - medication_name (string)
            - dosage (string, numbers only)
            - dosage_unit (string, e.g., "mg", "ml")
            - frequency (string, e.g., "daily", "weekly")
            - times_per_frequency (number)
            - preferred_time (array of strings, must only contain: "morning", "afternoon", "evening", or "bedtime", can be multiple values, needs to match the frequency, does not need to be spelled exactly as "morning", "afternoon", "evening", or "bedtime")
            - remaining_quantity (optional string)
            - notes (optional string)
            
            Guide the user through providing this information one step at a time.
            For preferred_time, only accept and return "morning", "afternoon", "evening", or "bedtime".
            Once all required information is collected, respond with "MEDICATION_COMPLETE:" followed by a valid JSON object containing the collected information.
            
            Example format:
            MEDICATION_COMPLETE:{"medication_name":"Aspirin","dosage":"500","dosage_unit":"mg","frequency":"daily","times_per_frequency":2,"preferred_time":["morning","evening"],"remaining_quantity":"30","notes":"Take with food"}
            
            Keep responses concise and focused on collecting medication information.`,
          },
          ...messages,
          userMessage,
        ],
        temperature: 0.7,
        max_tokens: 250,
      });

      const aiMessage =
        response.choices[0]?.message?.content ||
        "Sorry, I couldn't process that.";

      if (aiMessage.includes("MEDICATION_COMPLETE:")) {
        try {
          const jsonStr = aiMessage.split("MEDICATION_COMPLETE:")[1].trim();

          const medicationDetails = JSON.parse(jsonStr);

          // Validate preferred_time values
          const validTimeOfDay = ["morning", "afternoon", "evening", "bedtime"];
          const invalidTimes = medicationDetails.preferred_time.filter(
            (time: string) => !validTimeOfDay.includes(time)
          );

          if (invalidTimes.length > 0) {
            throw new Error(
              `Invalid preferred time values: ${invalidTimes.join(
                ", "
              )}. Must be one of: morning, afternoon, evening, bedtime`
            );
          }

          // Ensure preferred_time is an array of valid TimeOfDay values
          medicationDetails.preferred_time = Array.isArray(
            medicationDetails.preferred_time
          )
            ? medicationDetails.preferred_time
            : [medicationDetails.preferred_time];

          // Validate the parsed data
          const requiredFields = [
            "medication_name",
            "dosage",
            "dosage_unit",
            "frequency",
            "times_per_frequency",
            "preferred_time",
          ];

          const missingFields = requiredFields.filter(
            (field) => !medicationDetails[field]
          );

          if (missingFields.length > 0) {
            throw new Error(
              `Missing required fields: ${missingFields.join(", ")}`
            );
          }

          // Ensure times_per_frequency is a number
          medicationDetails.times_per_frequency = Number(
            medicationDetails.times_per_frequency
          );

          handleAIResponse({
            role: "assistant",
            content: "Great! I'll add this medication to your list.",
          });

          onMedicationComplete(medicationDetails);
        } catch (parseError) {
          handleAIResponse({
            role: "assistant",
            content:
              "I encountered an error processing the medication details. Let's try again from the beginning. What medication would you like to add?",
          });

          // Reset the conversation
          setMessages([]);
        }
      } else {
        handleAIResponse({ role: "assistant", content: aiMessage });
      }
    } catch (error: any) {
      console.error("API Error:", error);

      // Handle rate limiting
      if (error?.status === 429 && retryCount < MAX_RETRIES) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        await sleep(retryDelay);
        return handleSend(retryCount + 1);
      }

      // Handle other errors
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error?.status === 429) {
        errorMessage =
          "We're experiencing high demand. Please try again in a few minutes.";
      }

      handleAIResponse({
        role: "assistant",
        content: errorMessage,
      });

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles(colors).container}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles(colors).messagesContainer}
        contentContainerStyle={styles(colors).messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles(colors).messageContainer,
              message.role === "user"
                ? styles(colors).userMessage
                : styles(colors).assistantMessage,
            ]}
          >
            <Text
              style={[
                styles(colors).messageText,
                message.role === "user"
                  ? styles(colors).userMessageText
                  : styles(colors).assistantMessageText,
              ]}
            >
              {message.content}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles(colors).loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </ScrollView>

      <View style={styles(colors).inputContainer}>
        <TextInput
          style={styles(colors).input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles(colors).sendButton,
            !inputText.trim() && styles(colors).sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? "#007AFF" : "#A0A0A0"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  assistantMessageText: {
    color: colors.text,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    marginRight: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
