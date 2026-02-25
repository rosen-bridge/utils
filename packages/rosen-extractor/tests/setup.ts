import { ConsoleLogger } from '@rosen-bridge/abstract-logger';
import { chainValidators, chainDecoders } from '@rosen-bridge/address-codec';
import { AddressManager } from '@rosen-bridge/address-manager';

AddressManager.init(chainValidators, chainDecoders, new ConsoleLogger());
