_raiden_complete() {
    COMPREPLY=()
    local cur_word="${COMP_WORDS[COMP_CWORD]}"
    local prev_word="${COMP_WORDS[COMP_CWORD - 1]}"
    local subcommand="${COMP_WORDS[1]}"

    if [[ "$prev_word" == raiden ]]
    then
        local completions="request list"
        COMPREPLY=( $(compgen -W "$completions" -- "$cur_word") )
    elif [[ $subcommand == request ]]
    then
        if [[ "$cur_word" == - ]]
        then
            local completions=$(__request_completions short_options) 
            COMPREPLY=( $(compgen -W "$completions" -- "$cur_word") )
        elif [[ "$cur_word" == -* ]] 
        then
            local completions=$(__request_completions long_options) 
            COMPREPLY=( $(compgen -W "$completions" -- "$cur_word") )
        elif [[ "$prev_word" == --env ]] || [[ "$prev_word" == -e ]] 
        then
            local completions=$(__request_completions values)
            COMPREPLY=( $(compgen -W "$completions" -- "$cur_word") )
        else
            local completions=$(__request_completions args  )
            COMPREPLY=( $(compgen -W "$completions" -- "$cur_word") )
        fi
    elif [[ "$subcommand" == list ]]
    then
        if [[ "$cur_word" == -* ]]
        then
            local completions=$( __list_completions options)
            COMPREPLY=( $(compgen -W "$completions" -- "$cur_word") )
        fi
    fi

}

__list_completions() {
    if [[ $1 == options ]] ; then
        echo "--e"
    fi
}

__request_completions() {    
    if [[ $1 == long_options ]] ; then
        echo "--env --query --async --minimal --headers --body"
    elif [[ $1 == short_options ]] ; then
        echo "-e -q -a -m -h -b"
    elif [[ $1 == values ]] ; then
        echo "$(raiden config --list envs)"
    elif [[ $1 == args ]] ; then
        echo "$(raiden config --list requests)"
    fi
}

complete -F _raiden_complete raiden

