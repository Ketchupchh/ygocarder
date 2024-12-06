import { useCallback } from 'react';
import { Checkbox, Tooltip } from 'antd';
import { useCard, useLanguage } from '../../service';
import styled from 'styled-components';
import { useShallow } from 'zustand/react/shallow';
import { Card } from 'src/model';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const StyledCheckboxGroup = styled.div`
    align-self: center;
    text-align: right;
    .ant-checkbox + span {
        user-select: none;
    }
`;

export type CardCheckboxGroup = {};
export const CardCheckboxGroup = (_: CardCheckboxGroup) => {
    const language = useLanguage();
    const {
        isDuelTerminalCard,
        isFirstEdition,
        isSpeedCard,
        isLimitedEdition,
        isLegacyCard,
        setCard,
    } = useCard(useShallow(({
        card,
        setCard,
    }) => ({
        isSpeedCard: card.isSpeedCard,
        isDuelTerminalCard: card.isDuelTerminalCard,
        isFirstEdition: card.isFirstEdition,
        isLimitedEdition: card.isLimitedEdition,
        isLegacyCard: card.isLegacyCard,
        setCard,
    })));

    /** 
     * * In legacy mode: All marks stay at the bottom left of the artwork, and are mutually exclusive in this state.
     * * In modern mode, Limited Edition and 1st Edition text are exclusive at the right of password. Duel Terminal and Speed Duel text are exclusive at the bottom left of the artwork.
     */
    const onFirstEditionChange = useCallback((e: CheckboxChangeEvent) => setCard(currentCard => {
        const nextValue = e.target.checked;
        let updatedPart: Partial<Card>;

        if (nextValue) {
            if (isLegacyCard) {
                updatedPart = {
                    isDuelTerminalCard: false,
                    isFirstEdition: true,
                    isLimitedEdition: false,
                    isSpeedCard: false,
                };
            } else {
                updatedPart = {
                    isFirstEdition: true,
                    isLimitedEdition: false,
                };
            }
        } else updatedPart = {
            isFirstEdition: false,
        };

        return { ...currentCard, ...updatedPart };
    }), [setCard, isLegacyCard]);
    const onLimitedEditionChange = useCallback((e: CheckboxChangeEvent) => setCard(currentCard => {
        const nextValue = e.target.checked;
        let updatedPart: Partial<Card>;

        if (nextValue) {
            if (isLegacyCard) {
                updatedPart = {
                    isDuelTerminalCard: false,
                    isFirstEdition: false,
                    isLimitedEdition: true,
                    isSpeedCard: false,
                };
            } else {
                updatedPart = {
                    isFirstEdition: false,
                    isLimitedEdition: true,
                };
            }
        } else updatedPart = {
            isLimitedEdition: false,
        };

        return { ...currentCard, ...updatedPart };
    }), [setCard, isLegacyCard]);
    const onDuelTerminalCardChange = useCallback((e: CheckboxChangeEvent) => setCard(currentCard => {
        const nextValue = e.target.checked;
        let updatedPart: Partial<Card>;

        if (nextValue) {
            if (isLegacyCard) {
                updatedPart = {
                    isDuelTerminalCard: true,
                    isFirstEdition: false,
                    isLimitedEdition: false,
                    isSpeedCard: false,
                };
            } else {
                updatedPart = {
                    isSpeedCard: false,
                    isDuelTerminalCard: true,
                };
            }
        } else updatedPart = {
            isDuelTerminalCard: false,
        };

        return { ...currentCard, ...updatedPart };
    }), [setCard, isLegacyCard]);
    const onSpeedCardChange = useCallback((e: CheckboxChangeEvent) => setCard(currentCard => {
        const nextValue = e.target.checked;
        let updatedPart: Partial<Card>;

        if (nextValue) {
            if (isLegacyCard) {
                updatedPart = {
                    isDuelTerminalCard: false,
                    isFirstEdition: false,
                    isLimitedEdition: false,
                    isSpeedCard: true,
                };
            } else {
                updatedPart = {
                    isDuelTerminalCard: false,
                    isSpeedCard: true,
                };
            }
        } else updatedPart = {
            isSpeedCard: false,
        };

        return { ...currentCard, ...updatedPart };
    }), [setCard, isLegacyCard]);
    const onLegacyCardChange = useCallback((e: CheckboxChangeEvent) => setCard(currentCard => {
        const nextValue = e.target.checked;
        const {
            isDuelTerminalCard,
            isFirstEdition,
            isLimitedEdition,
            isSpeedCard,
        } = currentCard;
        /**
         * Resolve possible conflict here. Prefer 1st Edition and Speed Card if they are present. In legacy mode, 1st Eidition is always prefered.
         */
        let nextIsDuelTerminalCard = false;
        let nextIsFirstEdition = false;
        let nextIsLimitedEdition = false;
        let nextIsSpeedCard = false;

        if (nextValue) {
            nextIsFirstEdition = isFirstEdition;
            nextIsSpeedCard = nextIsFirstEdition ? false : isSpeedCard;
            nextIsDuelTerminalCard = (nextIsSpeedCard || nextIsFirstEdition) ? false : isDuelTerminalCard;
            nextIsLimitedEdition = (nextIsDuelTerminalCard || nextIsFirstEdition || nextIsLimitedEdition)
                ? false
                : isLimitedEdition;
        } else {
            nextIsFirstEdition = isFirstEdition;
            nextIsLimitedEdition = nextIsFirstEdition ? false : isLimitedEdition;

            nextIsSpeedCard = isSpeedCard;
            nextIsDuelTerminalCard = nextIsSpeedCard ? false : isDuelTerminalCard;
        }

        return {
            ...currentCard,
            isLegacyCard: nextValue,
            isDuelTerminalCard: nextIsDuelTerminalCard,
            isFirstEdition: nextIsFirstEdition,
            isLimitedEdition: nextIsLimitedEdition,
            isSpeedCard: nextIsSpeedCard,
        };
    }), [setCard]);

    return <StyledCheckboxGroup className="checkbox-input">
        <Tooltip overlayClassName="long-tooltip-overlay" overlay={language['input.legacy.tooltip']}>
            <Checkbox
                className="input-legacy"
                onChange={onLegacyCardChange}
                checked={isLegacyCard}
                tabIndex={0}
            >
                {language['input.legacy.label']}
            </Checkbox>
        </Tooltip>
        <Checkbox
            className="input-1st"
            onChange={onFirstEditionChange}
            checked={isFirstEdition}
            tabIndex={0}
        >
            {language['input.1st-edition.label']}
        </Checkbox>
        <Checkbox
            className="input-limited"
            onChange={onLimitedEditionChange}
            checked={isLimitedEdition}
            tabIndex={0}
        >
            {language['input.limited-edition.label']}
        </Checkbox>
        {/** They overlap if draw together, so we make them mutually exclusive. Maybe it is not worth the effort. */}
        <Checkbox
            className="input-speed"
            onChange={onSpeedCardChange}
            checked={isSpeedCard}
            tabIndex={0}
        >
            {language['input.speed-duel.label']}
        </Checkbox>
        <Checkbox
            className="input-terminal"
            onChange={onDuelTerminalCardChange}
            checked={isDuelTerminalCard}
            tabIndex={0}
        >
            {language['input.duel-terminal.label']}
        </Checkbox>
    </StyledCheckboxGroup>;
};