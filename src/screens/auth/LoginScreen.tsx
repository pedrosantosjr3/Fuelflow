import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput, Button, Checkbox} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useForm, Controller} from 'react-hook-form';

import {AuthStackParamList, LoginForm} from '@/types';
import {useAuth} from '@/hooks/useAuth';
import {COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES, VALIDATION, ERROR_MESSAGES} from '@/constants';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {login, loading, error} = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (err) {
      Alert.alert('Login Failed', error || ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate(SCREEN_NAMES.FORGOT_PASSWORD);
  };

  const handleSignUp = () => {
    navigation.navigate(SCREEN_NAMES.REGISTER);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
                autoComplete="password"
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

          <View style={styles.optionsContainer}>
            <Controller
              control={control}
              name="rememberMe"
              render={({field: {onChange, value}}) => (
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    onPress={() => onChange(!value)}
                    color={COLORS.PRIMARY_BLUE}
                  />
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>
              )}
            />

            <Button
              mode="text"
              onPress={handleForgotPassword}
              labelStyle={styles.forgotPasswordText}>
              Forgot Password?
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}>
            Sign In
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Button mode="text" onPress={handleSignUp} labelStyle={styles.signUpText}>
            Sign Up
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.DARK_SLATE,
    marginLeft: SPACING.SM,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY_BLUE,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    marginBottom: SPACING.XL,
  },
  loginButtonText: {
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
  signUpText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY_BLUE,
  },
});

export default LoginScreen;