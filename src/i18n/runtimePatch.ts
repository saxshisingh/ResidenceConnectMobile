import React from 'react';
import { Button, Text, TextInput } from 'react-native';

import { translateLiteral } from './I18nProvider';

let installed = false;
const TRANSLATABLE_PROP_KEYS = new Set([
  'title',
  'placeholder',
  'accessibilityLabel',
  'label',
  'message',
  'confirmText',
  'cancelText',
  'description',
]);

const translateNode = (node: unknown): unknown => {
  if (typeof node === 'string') {
    return translateLiteral(node);
  }
  if (Array.isArray(node)) {
    return node.map(translateNode);
  }
  return node;
};

const isReactNativeType = (type: unknown, nativeType: unknown) => {
  return type === nativeType;
};

const translateProps = (type: unknown, props: Record<string, unknown> | null | undefined) => {
  if (!props) return props;

  let nextProps = props;

  if (
    isReactNativeType(type, TextInput) &&
    typeof props.placeholder === 'string'
  ) {
    nextProps = {
      ...nextProps,
      placeholder: translateLiteral(props.placeholder),
    };
  }

  if (
    isReactNativeType(type, Button) &&
    typeof props.title === 'string'
  ) {
    nextProps = {
      ...nextProps,
      title: translateLiteral(props.title),
    };
  }

  if (typeof props.accessibilityLabel === 'string') {
    nextProps = {
      ...nextProps,
      accessibilityLabel: translateLiteral(props.accessibilityLabel),
    };
  }

  Object.entries(props).forEach(([key, value]) => {
    if (!TRANSLATABLE_PROP_KEYS.has(key) || typeof value !== 'string') {
      return;
    }
    const translatedValue = translateLiteral(value);
    if (translatedValue === value) {
      return;
    }
    nextProps = {
      ...nextProps,
      [key]: translatedValue,
    };
  });

  return nextProps;
};

export const installI18nRuntimePatch = () => {
  if (installed) return;
  installed = true;

  const originalCreateElement = React.createElement;
  React.createElement = ((type: unknown, props: any, ...children: unknown[]) => {
    let nextChildren = children;
    if (isReactNativeType(type, Text) && children.length > 0) {
      nextChildren = children.map(translateNode);
    }

    const nextProps = translateProps(type, props);
    return originalCreateElement(type as any, nextProps as any, ...(nextChildren as any[]));
  }) as typeof React.createElement;
};
