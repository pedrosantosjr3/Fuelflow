import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput, Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useForm, Controller} from 'react-hook-form';

import {AuthStackParamList} from '@/types';
import {useAuth} from '@/hooks/useAuth';
import {COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES, VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES} from '@/constants';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const {resetPassword, error} = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setLoading(true);
      await resetPassword(data.email);
      setEmailSent(true);
      Alert.alert('Email Sent', SUCCESS_MESSAGES.PASSWORD_RESET);
    } catch (err) {
      Alert.alert('Error', error || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate(SCREEN_NAMES.LOGIN);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            {emailSent
              ? 'We\'ve sent a password reset link to your email address'
              : 'Enter your email address and we\'ll send you a link to reset your password'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!emailSent ? (
            <>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: ERROR_MESSAGES.REQUIRED_FIELD,
                  pattern: {
                    value: VALIDATION.EMAIL_REGEX,
                    message: ERROR_MESSAGES.INVALID_EMAIL,
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                  />
                )}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
                labelStyle={styles.submitButtonText}
                contentStyle={styles.buttonContent}
                loading={loading}
                disabled={loading}>
                Send Reset Link
              </Button>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✉️</Text>
              <Text style={styles.successText}>
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </Text>
              
              <Button
                mode="outlined"
                onPress={onSubmit}
                style={styles.resendButton}
                labelStyle={styles.resendButtonText}
                contentStyle={styles.buttonContent}
                loading={loading}
                disabled={loading}>
                Resend Email
              </Button>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="text"
            onPress={handleBackToLogin}
            labelStyle={styles.backToLoginText}>
            Back to Sign In
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PURE_WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.XL,
    paddingTop: SPACING.XXXL,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XXXL,
  },
  title: {
    ...TYPOGRAPHY.DISPLAY,
    color: COLORS.DARK_SLATE,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.PURE_WHITE,
  },
  errorText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.DANGER_RED,
    marginTop: -SPACING.SM,
    marginBottom: SPACING.MD,
    marginLeft: SPACING.SM,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    marginTop: SPACING.XL,
  },
  submitButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.PURE_WHITE,
  },
  buttonContent: {
    paddingVertical: SPACING.MD,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: SPACING.XXXL,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: SPACING.XL,
  },
  successText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.XL,
  },
  resendButton: {
    borderColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    borderWidth: 1,
  },
  resendButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.PRIMARY_BLUE,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.XL,
  },
  backToLoginText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY_BLUE,
  },
});

export default ForgotPasswordScreen;