export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      isPhoneVerified?: boolean
      onBoardingStage: number
    }
  }
}