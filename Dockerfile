FROM public.ecr.aws/lambda/nodejs:14

RUN npm install -g npm

COPY ./ ./

ARG APP_URL
ARG DATABASE_URL
ARG GA_PROPERTY_ID
ARG SOCIAL_CARE_APP_URL
ARG CSRF_SECRET
ARG HACKNEY_AUTH_SERVER_URL
ARG SENTRY_RELEASE
ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG ENVIRONMENT

ENV APP_URL=${APP_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_APP_URL=${APP_URL}
ENV NEXT_PUBLIC_GA_PROPERTY_ID=${GA_PROPERTY_ID}
ENV NEXT_PUBLIC_SOCIAL_CARE_APP_URL=${SOCIAL_CARE_APP_URL}
ENV NEXT_PUBLIC_HACKNEY_AUTH_SERVER_URL=${HACKNEY_AUTH_SERVER_URL}
ENV HACKNEY_AUTH_SERVER_URL=${HACKNEY_AUTH_SERVER_URL}
ENV CSRF_SECRET=${CSRF_SECRET}
ENV SENTRY_RELEASE=${SENTRY_RELEASE}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
ENV NEXT_PUBLIC_ENVIRONMENT=${ENVIRONMENT}

RUN rm -rf ./node_modules/ \
    && npm install \
    && npm run build
