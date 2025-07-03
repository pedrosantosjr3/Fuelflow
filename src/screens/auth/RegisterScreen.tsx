import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput, Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useForm, Controller} from 'react-hook-form';

import {AuthStackParamList, RegisterForm} from '@/types';
import {useAuth} from '@/hooks/useAuth';
import {COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES, VALIDATION, ERROR_MESSAGES} from '@/constants';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const {register, loading, error} = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
  } = useForm<RegisterForm>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register(data);
    } catch (err) {
      Alert.alert('Registration Failed', error || ERROR_MESSAGES.GENERIC_ERROR);
    }
  };

  const handleSignIn = () => {
    navigation.navigate(SCREEN_NAMES.LOGIN);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Fill in the details below to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.nameContainer}>
              <Controller
                control={control}
                name="firstName"
                rules={{
                  required: ERROR_MESSAGES.REQUIRED_FIELD,
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    label="First Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={[styles.input, styles.nameInput]}
                    autoCapitalize="words"
                    autoComplete="name-given"
                    error={!!errors.firstName}
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                rules={{
                  required: ERROR_MESSAGES.REQUIRED_FIELD,
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    label="Last Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={[styles.input, styles.nameInput]}
                    autoCapitalize="words"
                    autoComplete="name-family"
                    error={!!errors.lastName}
                  />
                )}
              />
            </View>
            {(errors.firstName || errors.lastName) && (
              <Text style={styles.errorText}>
                {errors.firstName?.message || errors.lastName?.message}
              </Text>
            )}

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

            <Controller
              control={control}
              name="phoneNumber"
              rules={{
                required: ERROR_MESSAGES.REQUIRED_FIELD,
                pattern: {
                  value: VALIDATION.PHONE_REGEX,
                  message: ERROR_MESSAGES.INVALID_PHONE,
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  error={!!errors.phoneNumber}
                />
              )}
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}

            <Controller
              control={control}
              name="password"
              rules={{
                required: ERROR_MESSAGES.REQUIRED_FIELD,
                minLength: {
                  value: VALIDATION.PASSWORD_MIN_LENGTH,
                  message: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  error={!!errors.password}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: ERROR_MESSAGES.REQUIRED_FIELD,
                validate: value => value === password || ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  error={!!errors.confirmPassword}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.registerButton}
              labelStyle={styles.registerButtonText}
              contentStyle={styles.buttonContent}
              loading={loading}
              disabled={loading}>
              Create Account
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button mode="text" onPress={handleSignIn} labelStyle={styles.signInText}>
              Sign In
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PURE_WHITE,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.XL,
    paddingTop: SPACING.XL,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
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
  },
  form: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: SPACING.MD,
  },
  nameInput: {
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
  registerButton: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    marginTop: SPACING.XL,
    marginBottom: SPACING.XL,
  },
  registerButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.PURE_WHITE,
  },
  buttonContent: {
    paddingVertical: SPACING.MD,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.XL,
  },
  footerText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
  },
  signInText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY_BLUE,
  },
});

export default RegisterScreen;